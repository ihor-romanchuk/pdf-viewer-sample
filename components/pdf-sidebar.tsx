import { Resizable } from "re-resizable";
import PdfQaCards from "./pdf-qa-cards";

export default function PdfSidebar() {
  return (
    <Resizable
      defaultSize={{
        width: 480,
        height: "100%",
      }}
      minWidth={300}
      minHeight="100%"
      maxHeight="100%"
      className="overflow-hidden">
      <div className="flex flex-col overflow-hidden max-h-full">
        <div className="border-b border-r border-gray-200">
          <div className="px-5 text-sm font-medium text-center text-gray-500 dark:text-gray-400">
            <ul className="flex flex-wrap -mb-px">
              <li className="me-2">
                <a
                  href="#"
                  className="inline-block pt-3 pb-3 text-blue-600 border-b-2 border-blue-600 rounded-t-lg active dark:text-blue-500 dark:border-blue-500"
                  aria-current="page">
                  Profile Matter
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="pt-3 pl-5 pr-3 mt-0.5 mr-0.5 flex-grow scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar scrollbar-w-1.5 scrollbar-thumb-gray-300 scrollbar-track-transparent overflow-auto hover:scrollbar-thumb-gray-300 active:scrollbar-thumb-gray-300">
          <PdfQaCards />
        </div>
      </div>
    </Resizable>
  );
}
