"use client";

import WebViewer from "@pdftron/webviewer";
import { useEffect, useRef } from "react";
import { usePdfContext } from "./pdf-context";

interface PdfViewerProps {
  height?: string;
}

export default function PdfViewer({ height = "100vh" }: PdfViewerProps) {
  const { setWebViewerInstance } = usePdfContext();
  const viewerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (viewer) {
      WebViewer(
        {
          initialDoc: "/files/demo.pdf",
          path: "/webviewer/lib",
          css: "/webviewer.css",
          enableAnnotations: true,
          enableMeasurement: false,
          disabledElements: [
            "toolsHeader",
            "viewControlsButton",
            "leftPanelButton",
            "panToolButton",
            "selectToolButton",
            "toggleNotesButton",
          ],
          isReadOnly: true,
          fullAPI: true,
        },
        viewer
      ).then(async (instance) => {
        setWebViewerInstance(instance);
        const { UI, Core } = instance;
        const { documentViewer, Annotations } = Core;

        UI.disableFadePageNavigationComponent();
        documentViewer.setSearchHighlightColors({
          searchResult: new Annotations.Color(252, 233, 106, 1),
          activeSearchResult: new Annotations.Color(252, 233, 106, 1),
        });

        documentViewer.addEventListener("documentLoaded", () => {
          UI.setFitMode(UI.FitMode.FitWidth);
        });
      });
    }

    return () => {
      if (viewer) viewer.innerHTML = "";
    };
  }, [setWebViewerInstance]);

  return <div ref={viewerRef} style={{ height }} />;
}
