import React, { useState } from "react";
import { DataPoint, usePdfContext } from "./pdf-context";

const dataPoints: DataPoint[] = [
  {
    contextSummary: "dated as of May 1, 2005",
    value: "May 1, 2005",
  },
  {
    contextSummary:
      'among NEWTON ACQUISITION, INC., a Delaware corporation ("Parent"), NEWTON ACQUISITION MERGER SUB, INC., a Delaware corporation and a direct wholly-owned subsidiary of Parent ("Merger Sub"), and THE NEIMAN MARCUS GROUP, INC.',
    value: "NEWTON ACQUISITION, INC.",
  },
  {
    contextSummary:
      'WHEREAS, the Board of Directors of the Company has unanimously (i) determined that it is in the best interests of the Company and the stockholders of the Company, and declared it advisable, to enter into this Agreement with Parent and Merger Sub providing for the merger (the "Merger") of Merger Sub with and into the Company in accordance with the General Corporation Law of the State of Delaware (the "DGCL"), upon the terms and subject to the conditions set forth herein, (ii) approved this Agreement in accordance with the DGCL, upon the terms and subject to the conditions set forth herein, and (iii) resolved to recommend adoption of this Agreement by the stockholders of the Company;',
    value: "Merger",
  },
  {
    contextSummary:
      "(h) Neither the Company nor any of its subsidiaries has any liabilities of a nature required by generally accepted accounting principles to be reflected in a consolidated balance sheet or the notes thereto, except liabilities that (i) are accrued or reserved against in the most recent financial statements included in the SEC Reports filed prior to the date hereof or are reflected in the notes thereto, (ii) were incurred in the ordinary course of business since the date of such financial statements, (iii) are incurred pursuant to the transactions contemplated by this Agreement, (iv) have been discharged or paid in full prior to the date of this Agreement in the ordinary course of business or (v) as would not reasonably be expected to have, individually or in the aggregate, a Material Adverse Effect.",
    value: "Buyer-friendly",
  },
  {
    contextSummary:
      "(a) the representations and warranties of Parent and Merger Sub set forth in this Agreement shall be true and correct in all material respects, in each case as of the Effective Time as though made on and as of such date (unless any such representation or warranty is made only as of a specific date, in which event such representation and warranty shall be true and correct in all material respects as of such specified date); (b) each of Parent and Merger Sub shall have performed in all material respects the obligations, and complied in all material respects with the agreements and covenants, required to be performed by or complied with by it under this Agreement at or prior to the Closing Date;",
    value: "Yes",
  },
  {
    contextSummary:
      '(a) (i) the representations and warranties set forth in Sections 3.3 (a) and 3.18 shall be true and correct as of the date of this Agreement and as of the Effective Time as though made on and as of the Effective Time (except to the extent expressly made as of an earlier date, in which case as of such earlier date), except for any failure to be true and correct that would be immaterial to Parent and Merger Sub; and (ii) the other representations and warranties of the Company contained in this Agreement shall be true and correct (without giving effect to any limitation on any representation or warranty indicated by the words "Material Adverse Effect", "in all material respects", "in any material respect", "material" or "materially," except for the limitation set forth in clause (i) of Section 3.8) as of the date of this Agreement and as of the Effective Time, as though made on and as of the Effective Time (except to the extent expressly made as of an earlier date, in which case as of such earlier date), except where the failure of any such representations and warranties to be so true and correct would not reasonably be expected to have, individually or in the aggregate, a Material Adverse Effect.',
    value: "Yes",
  },
  {
    contextSummary:
      "This Agreement shall be governed by, and construed in accordance with, the laws of the State of Delaware (without giving effect to choice of law principles thereof).",
    value: "Delaware",
  },
  {
    contextSummary:
      "(b) the Company shall have performed in all material respects the obligations, and complied in all material respects with the agreements and covenants, required to be performed by, or complied with by, it under this Agreement at or prior to the Effective Time;",
    value: "Yes",
  },
];

export default function PdfQaCards() {
  const { highlightDataPoint } = usePdfContext();

  return (
    <div className="flex flex-col gap-0.5">
      {dataPoints.map((dataPoint, index) => (
        <div
          key={index}
          className="border p-2 cursor-pointer hover:bg-gray-50"
          onClick={() => highlightDataPoint(dataPoint)}>
          <span className="text-gray-600 font-normal">{dataPoint.value}</span>
        </div>
      ))}
    </div>
  );
}
