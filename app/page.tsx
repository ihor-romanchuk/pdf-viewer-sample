"use client";

import { PdfContextContainer } from "../components/pdf-context";
import PdfSidebar from "../components/pdf-sidebar";
import PdfViewer from "../components/pdf-viewer";

export default function Home() {
  return (
    <PdfContextContainer>
      <div className="flex flex-col h-screen overflow-hidden bg-white">
        <div className="flex flex-grow overflow-hidden">
          <PdfSidebar />

          <div className="flex-grow">
            <PdfViewer height="calc(100vh - 64px)" />
          </div>
        </div>
      </div>
    </PdfContextContainer>
  );
}
