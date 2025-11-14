import React from "react";

export default function SeatMap({ seats, selected, toggle }) {
  const byRow = seats.reduce((acc, s) => {
    acc[s.row_label] = acc[s.row_label] || [];
    acc[s.row_label].push(s);
    return acc;
  }, {});

  Object.values(byRow).forEach(row => row.sort((a, b) => a.seat_number - b.seat_number));

  return (
    <div style={{ display: "grid", gap: 8, marginTop: 12, padding: 12, border: "1px solid #ddd", borderRadius: 8 }}>
      {Object.keys(byRow).sort().map(row => (
        <div key={row} style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <div style={{ width: 20, textAlign: "center", fontWeight: 500 }}>{row}</div>
          {byRow[row].map(seat => {
            const isSel = selected.includes(seat.id);
            const isBooked = seat.status === "BOOKED";
            return (
  <button
    key={seat.id}
    type="button"          // не сабмитит форму, всё нормально
    onClick={() => !isBooked && toggle(seat.id)}
    style={{
      width: 28,
      height: 28,
      borderRadius: 4,
      border: "1px solid #ccc",
      background: isBooked ? "#999" : isSel ? "#4ade80" : "#fff",
      cursor: isBooked ? "not-allowed" : "pointer",
      fontSize: 12
    }}
    title={`${seat.row_label}${seat.seat_number} ${isBooked ? "(booked)" : ""}`}
  >
    {seat.seat_number}
  </button>
);

          })}
        </div>
      ))}
      <div style={{ fontSize: 12, color: "#555", marginTop: 4 }}>
        <span style={{ marginRight: 12 }}>□ free</span>
        <span style={{ marginRight: 12 }}>■ selected</span>
        <span>■ booked</span>
      </div>
    </div>
  );
}
