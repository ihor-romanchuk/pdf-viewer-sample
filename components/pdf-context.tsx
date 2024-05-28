import { Core, WebViewerInstance } from "@pdftron/webviewer";
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

interface SearchResult {
  pageNum: number;
  quads: Core.Math.Quad[];
  resultCode: number;
  resultStr: string;
}

export interface DataPoint {
  contextSummary?: string;
  value: string;
}

export interface PdfContextProps {
  webViewerInstance: WebViewerInstance | undefined;
  setWebViewerInstance: React.Dispatch<
    React.SetStateAction<WebViewerInstance | undefined>
  >;
  highlightDataPoint: (dataPoint: DataPoint) => void;
}

export const PdfContext = createContext<PdfContextProps>({} as PdfContextProps);

const fillSpaceBetweenWords = (
  webViewerInstance: WebViewerInstance,
  quads: Core.Math.Quad[]
) => {
  const { Math } = webViewerInstance.Core;

  const rects = quads
    .filter((quad) => quad.x1 != undefined)
    .map((quad) =>
      new Math.Quad(
        quad.x1,
        quad.y1,
        quad.x2,
        quad.y2,
        quad.x3,
        quad.y3,
        quad.x4,
        quad.y4
      ).toRect()
    );

  const newQuads = [];
  let tempRect: Core.Math.Rect | null = null;

  for (let i = 0; i < rects.length; i++) {
    const rect = rects[i];
    if (tempRect) {
      //Check if we are still on the same line or on a new line
      const centerPoint = rect.getCenter();
      if (tempRect.y1 < centerPoint.y && tempRect.y2 > centerPoint.y) {
        tempRect.x2 = rect.x2;
        tempRect.y2 = rect.y2;
      } else {
        newQuads.push(tempRect.toQuad());
        tempRect = new Math.Rect(rect.x1, rect.y1, rect.x2, rect.y2);
      }
    } else {
      tempRect = new Math.Rect(rect.x1, rect.y1, rect.x2, rect.y2);
    }
  }

  if (tempRect) newQuads.push(tempRect.toQuad());

  return newQuads;
};

const highlightText = (
  webViewerInstance: WebViewerInstance,
  quads: Core.Math.Quad[],
  pageIndex: number
) => {
  const { annotationManager, Annotations, Math } = webViewerInstance.Core;

  const annotation = new Annotations.TextHighlightAnnotation({
    PageNumber: pageIndex,
    Quads: quads,
    StrokeColor: new Annotations.Color(0, 250, 255, 1),
  });

  annotationManager.addAnnotation(annotation);
  annotationManager.redrawAnnotation(annotation);
};

const getPageText = async (
  webViewerInstance: WebViewerInstance,
  pageTextCache: Record<number, string>,
  pageNumber: number
) => {
  if (pageTextCache[pageNumber]) return pageTextCache[pageNumber];

  const { documentViewer, PDFNet } = webViewerInstance.Core;
  const doc = await documentViewer.getDocument().getPDFDoc();
  const page = await doc.getPage(pageNumber);

  const txt = await PDFNet.TextExtractor.create();
  txt.begin(page);

  const words: string[] = [];
  let line = await txt.getFirstLine();
  for (; await line.isValid(); line = await line.getNextLine()) {
    for (
      var word = await line.getFirstWord();
      await word.isValid();
      word = await word.getNextWord()
    ) {
      const text = await word.getString();
      words.push(text);
    }
  }
  const pageText = words.join(" ");

  pageTextCache[pageNumber] = pageText;

  return pageText;
};

const highlightValue = async (
  webViewerInstance: WebViewerInstance,
  pageTextCache: Record<number, string>,
  context: string,
  value: string,
  pageNumber: number
) => {
  const { documentViewer, annotationManager } = webViewerInstance.Core;
  annotationManager.deleteAnnotations(annotationManager.getAnnotationsList());
  const pageText = await getPageText(
    webViewerInstance,
    pageTextCache,
    pageNumber
  );

  const startIndexOfContext = pageText.indexOf(context);
  const startIndex = pageText.indexOf(value, startIndexOfContext);
  if (startIndex !== -1) {
    const endIndex = startIndex + value.length;
    const document = documentViewer.getDocument();
    let quads = (await document.getTextPosition(
      pageNumber,
      startIndex,
      endIndex
    )) as Core.Math.Quad[];

    if (pageText.includes(" "))
      quads = fillSpaceBetweenWords(webViewerInstance, quads);
    highlightText(webViewerInstance, quads, pageNumber);
  }
};

const search = (
  webViewerInstance: WebViewerInstance,
  searchText: string,
  startPage?: number,
  endPage?: number
) => {
  return new Promise<SearchResult | null>((resolve) => {
    const { documentViewer, Search } = webViewerInstance.Core;

    const mode = Search.Mode.HIGHLIGHT;
    const searchOptions = {
      fullSearch: true,
      startPage,
      endPage,
      onResult: (result: SearchResult) => {
        resolve(result.resultCode === Search.ResultCode.FOUND ? result : null);
      },
      onDocumentEnd: () => {
        resolve(null);
      },
    };

    documentViewer.textSearchInit(searchText, mode, searchOptions);
  });
};

//TODO: handle scenario where at some point there will be more than 1 search result
const multiPageSearch = async (
  webViewerInstance: WebViewerInstance,
  pageTextCache: Record<number, string>,
  searchText: string,
  skipFullSearch = false,
  startPage?: number,
  endPage?: number
): Promise<SearchResult[]> => {
  if (!skipFullSearch) {
    const searchResult = await search(
      webViewerInstance,
      searchText,
      startPage,
      endPage
    );
    if (searchResult) {
      return [searchResult];
    }
  }

  const halfLength = Math.ceil(searchText.length / 2);
  const splitIndex = searchText.indexOf(" ", halfLength);
  const firstHalf = searchText.substring(0, splitIndex);
  const secondHalf = searchText.substring(splitIndex);

  const firstHalfResult = await search(
    webViewerInstance,
    firstHalf,
    startPage,
    endPage
  );
  if (firstHalfResult) {
    const pageText = await getPageText(
      webViewerInstance,
      pageTextCache,
      firstHalfResult.pageNum
    );

    const startIndex = pageText.indexOf(firstHalfResult.resultStr);
    if (startIndex === -1)
      throw new Error(
        `Text not found in page. Text: ${firstHalfResult.resultStr}. Page: ${firstHalfResult.pageNum}`
      );

    const newFirstHalf = pageText.substring(startIndex);
    const newSecondHalf = searchText.substring(newFirstHalf.length).trimStart(); // A whitespace between words

    const newFirstHalfResult = await search(
      webViewerInstance,
      newFirstHalf,
      firstHalfResult.pageNum,
      firstHalfResult.pageNum
    );
    if (!newFirstHalfResult)
      throw new Error(
        `Text not found in page. Text: ${newFirstHalf}. Page: ${firstHalfResult.pageNum}`
      );
    const newSecondHalfResult = await multiPageSearch(
      webViewerInstance,
      pageTextCache,
      newSecondHalf,
      false,
      firstHalfResult.pageNum + 1
    );

    return [newFirstHalfResult, ...newSecondHalfResult];
  }

  const secondHalfResult = await search(
    webViewerInstance,
    secondHalf,
    startPage,
    endPage
  );
  if (secondHalfResult) {
    const pageText = await getPageText(
      webViewerInstance,
      pageTextCache,
      secondHalfResult.pageNum
    );

    const startIndex = pageText.indexOf(secondHalfResult.resultStr);
    if (startIndex === -1)
      throw new Error(
        `Text not found in page. Text: ${secondHalfResult.resultStr}. Page: ${secondHalfResult.pageNum}`
      );

    const newSecondHalf = pageText.substring(
      0,
      startIndex + secondHalfResult.resultStr.length
    );
    const newFirstHalf = searchText
      .substring(searchText.indexOf(newSecondHalf))
      .trimEnd(); // A whitespace between words

    const newSecondHalfResult = await search(
      webViewerInstance,
      newSecondHalf,
      secondHalfResult.pageNum,
      secondHalfResult.pageNum
    );
    if (!newSecondHalfResult)
      throw new Error(
        `Text not found in page. Text: ${newSecondHalf}. Page: ${secondHalfResult.pageNum}`
      );
    const newFirstHalfResult = await multiPageSearch(
      webViewerInstance,
      pageTextCache,
      newFirstHalf,
      false,
      undefined,
      secondHalfResult.pageNum - 1
    );

    return [...newFirstHalfResult, newSecondHalfResult];
  }

  return [
    ...(await multiPageSearch(
      webViewerInstance,
      pageTextCache,
      firstHalf,
      true,
      startPage,
      endPage
    )),
    ...(await multiPageSearch(
      webViewerInstance,
      pageTextCache,
      secondHalf,
      true,
      startPage,
      endPage
    )),
  ];
};

interface PdfContextContainerProps {
  children?: React.ReactNode;
}

export const PdfContextContainer = ({ children }: PdfContextContainerProps) => {
  const [webViewerInstance, setWebViewerInstance] =
    useState<WebViewerInstance>();

  const pageTextCache = useMemo<Record<number, string>>(
    () => ({}),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [webViewerInstance]
  );

  const highlightDataPoint = useCallback(
    async (dataPoint: DataPoint) => {
      if (webViewerInstance) {
        const { documentViewer } = webViewerInstance.Core;

        const results = await multiPageSearch(
          webViewerInstance,
          pageTextCache,
          dataPoint.contextSummary!
        );
        documentViewer.clearSearchResults();

        if (results.length > 0) {
          documentViewer.displayAdditionalSearchResults(results);
          documentViewer.setActiveSearchResult(results[0]);

          await highlightValue(
            webViewerInstance,
            pageTextCache,
            dataPoint.contextSummary!,
            dataPoint.value,
            results[0].pageNum
          );
        }
      }
    },
    [pageTextCache, webViewerInstance]
  );

  const context: PdfContextProps = {
    webViewerInstance,
    setWebViewerInstance,
    highlightDataPoint,
  };

  return <PdfContext.Provider value={context}>{children}</PdfContext.Provider>;
};

export const usePdfContext = () => {
  return useContext(PdfContext);
};
