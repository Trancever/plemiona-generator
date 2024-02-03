export function processSheet(data) {
  // remove first row
  data = data.slice(1);

  const coords = data
    .map((row) => {
      return row[5];
    })
    .filter(Boolean);

  const attackGroups = data
    .filter((row) => Boolean(row[1]))
    .map((row) => {
      return {
        arrivalTime: row[1],
        numOfAttacks: row[2],
        attackName: row[3],
      };
    });

  let csv = "";

  for (const coord of coords) {
    for (const attackGroup of attackGroups) {
      const splittedArrivalTime = attackGroup.arrivalTime.split(";");

      const maxArrivalTimeH = parseInt(splittedArrivalTime[0], 10) + 2;
      const maxArrivalTime = [
        maxArrivalTimeH,
        splittedArrivalTime[1],
        splittedArrivalTime[2],
      ].join(";");

      csv += `${coord},${attackGroup.numOfAttacks},${attackGroup.attackName},${attackGroup.arrivalTime};${maxArrivalTime}\n`;
    }
  }

  return csv;

  // const sheetNameEscaped = sheet.replaceAll(" ", "-");

  // const fileName = `target-${sheetNameEscaped}.csv`;

  // console.log(`Finished processing ${sheet} sheet`);
  // fs.writeFileSync(`./targets/${fileName}`, csv);
  // console.log(`Created file ${fileName}`);
}
