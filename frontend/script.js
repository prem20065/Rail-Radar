fetch("http://127.0.0.1:5000/api/data")
  .then(res => res.json())
  .then(data => {
    const tbody = document.querySelector("tbody");
    tbody.innerHTML = "";
    data.forEach(row => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${row.Train_No}</td>
        <td>${row.Station}</td>
        <td>${row.Route}</td>
        <td>${row.Date}</td>
        <td>${row.Scheduled_Time}</td>
        <td>${row.Actual_Time}</td>
        <td>${row.Delay_Minutes}</td>
        <td>${row.Reason}</td>
      `;
      tbody.appendChild(tr);
    });
  })
  .catch(err => console.error(err));
 
