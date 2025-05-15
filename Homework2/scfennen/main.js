// Plot 1 - Alcohol consumption by age
d3.csv("data.csv").then((data) => {
    console.log(data);

    // Calculate average alcohol consumption by age
    const averageByAge = d3.rollups(data,
        v => ({
            avgDalc: d3.mean(v, d => +d.Dalc) || 0,
            avgWalc: d3.mean(v, d => +d.Walc) || 0
        }),
        d => d.age
    );

    averageByAge.sort((a, b) => a[0] - b[0]);
    console.log(averageByAge);

    const svg1 = d3.select("#view3")
        .append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", "325 -50 400 550");

    // Scales
    const xScale = d3.scaleBand()
        .domain(averageByAge.map(d => d[0]))
        .range([0, 1000])
        .padding(0.2);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(averageByAge, d => d[1].avgDalc + d[1].avgWalc)])
        .range([450, 50]);

    // Axes
    svg1.append("g")
        .attr("transform", "translate(50, 450)")
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .style("font-size", "12px")
        .attr("transform", "rotate(-45)")
        .attr("text-anchor", "end");

    svg1.append("g")
        .attr("transform", "translate(50, 0)")
        .call(d3.axisLeft(yScale))
        .selectAll("text")
        .style("font-size", "12px");

    // Labels
    svg1.append("text")
        .attr("x", 575)
        .attr("y", 490)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Age");
    
    svg1.append("text")
        .attr("x", -250)
        .attr("y", 15)
        .attr("transform", "rotate(-90)")
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Average Alcohol Consumption");

    // Bars
    svg1.selectAll(".bar-dalc")
        .data(averageByAge)
        .enter()
        .append("rect")
        .attr("class", "bar-dalc")
        .attr("x", d => xScale(d[0]) + 50)
        .attr("y", d => yScale(d[1].avgDalc))
        .attr("width", xScale.bandwidth())
        .attr("height", d => 450 - yScale(d[1].avgDalc))
        .attr("fill", "#1f77b4");

    svg1.selectAll(".bar-walc")
        .data(averageByAge)
        .enter()
        .append("rect")
        .attr("class", "bar-walc")
        .attr("x", d => xScale(d[0]) + 50)
        .attr("y", d => yScale(d[1].avgDalc + d[1].avgWalc))
        .attr("width", xScale.bandwidth())
        .attr("height", d => 450 - yScale(d[1].avgWalc))
        .attr("fill", "#aec7e8");

    // Legend
    const legend = svg1.append("g")
        .attr("transform", "translate(650, 50)");

    const colors = [
        { color: "#1f77b4", text: "Weekday Drinking (Dalc)" },
        { color: "#aec7e8", text: "Weekend Drinking (Walc)" }
    ];

    colors.forEach((d, i) => {
        legend.append("rect")
            .attr("x", 0)
            .attr("y", i * 20)
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", d.color);
        legend.append("text")
            .attr("x", 20)
            .attr("y", i * 20 + 12)
            .text(d.text);
    });

}).catch((error) => {
    console.error("Error loading the CSV file:", error);
});

// Plot 2 - Number of students with absences
d3.csv("data.csv").then((data) => {
    console.log(data);

    // Parse data
    const absencesGrouped = [
        {range: "0-9 absences", value: d3.sum(data, d => +d.absences < 10 ? 1 : 0)},
        {range: "10-19 absences", value: d3.sum(data, d => +d.absences >= 10 && +d.absences < 20 ? 1 : 0)},
        {range: "20-29 absences", value: d3.sum(data, d => +d.absences >= 20 && +d.absences < 30 ? 1 : 0)},
        {range: "30-39 absences", value: d3.sum(data, d => +d.absences >= 30 && +d.absences < 40 ? 1 : 0)},
        {range: "40-49 absences", value: d3.sum(data, d => +d.absences >= 40 && +d.absences < 50 ? 1 : 0)},
        {range: "50-59 absences", value: d3.sum(data, d => +d.absences >= 50 && +d.absences < 60 ? 1 : 0)},
        {range: "60-69 absences", value: d3.sum(data, d => +d.absences >= 60 && +d.absences < 70 ? 1 : 0)},
        {range: "70-79 absences", value: d3.sum(data, d => +d.absences >= 70 && +d.absences < 80 ? 1 : 0)},
        {range: "80-89 absences", value: d3.sum(data, d => +d.absences >= 80 && +d.absences < 90 ? 1 : 0)},
        {range: "90-99 absences", value: d3.sum(data, d => +d.absences >= 90 && +d.absences < 100 ? 1 : 0)},
    ]

    const total = absencesGrouped.reduce((sum, group) => sum + group.value, 0);

    absencesGrouped.forEach(group => {
        group.percentage = ((group.value / total) * 100).toFixed(2);
    });

    // Width and radius update based on size of the view
    const view1 = document.querySelector("#view1");
    const width = view1.clientWidth;
    const height = view1.clientHeight;
    const radius = Math.min(width, height) / 3;

    const svg2 = d3.select("#view1")
        .append("svg")
        .attr("width", width)
        .attr("height", height)

    const g = svg2.append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2 + 25})`);

    const color = d3.scaleOrdinal()
        .domain(absencesGrouped.map(d => d.range))
        .range(d3.schemeCategory10);
    
    // Create pie chart
    const pie = d3.pie()
        .value(d => d.value);

    const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius);

    // Draw pie chart
    g.selectAll("path")
        .data(pie(absencesGrouped))
        .enter()
        .append("path")
        .attr("d", arc)
        .attr("fill", d => color(d.data.range))
        .attr("stroke", "#ffffff")
        .attr("stroke-width", "2px");

    svg2.append("text")
        .attr("x", width / 2)
        .attr("y", height / 2 + height / 2.25)
        .attr("text-anchor", "middle")
        .style("font-size", "30px")
        .style("font-weight", "bold")
        .style("fill", "black")
        .style("visibility", "visible")
        .text("Student Absences");

    // Legend
    const legend = svg2.append("g")
        .attr("transform", `translate(${width - 200}, ${height / 4})`);

    legend.selectAll("rect")
        .data(absencesGrouped)
        .enter()
        .append("rect")
        .attr("x", 0)
        .attr("y", (d, i) => i * 20)
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", d => color(d.range));

    legend.selectAll("text")
        .data(absencesGrouped)
        .enter()
        .append("text")
        .attr("x", 20)
        .attr("y", (d, i) => i * 20 + 12)
        .text(d => `${d.range} (${d.percentage}%)`)
        .style("font-size", "12px")
        .attr("alignment-baseline", "middle");

});

// Plot 3 - Links between studytime, freetime, goout, Dalc, Walc
d3.csv("data.csv").then((data) => {
    console.log(data);

    // Data parsing
    data.forEach(d => {
        d.studytime = +d.studytime;
        d.freetime = +d.freetime;
        d.goout = +d.goout;
        d.Dalc = +d.Dalc;
        d.Walc = +d.Walc;
    });

    const dimensions = ["studytime", "freetime", "goout", "Dalc", "Walc"];
    const margin = { top: 30, right: 20, bottom: 50, left: 20 };
    const width = document.querySelector("#view2").clientWidth - margin.left - margin.right;
    const height = document.querySelector("#view2").clientHeight - margin.top - margin.bottom;

    const svg = d3.select("#view2")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom + 50)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales
    const y = {};
    for (let i in dimensions) {
        y[dimensions[i]] = d3.scaleLinear()
            .domain(d3.extent(data, d => d[dimensions[i]]))
            .range([height, 0]);
    }

    const x = d3.scalePoint()
        .domain(dimensions)
        .range([0, width])
        .padding(0.5);

    // Color lines
    const colorScale = d3.scaleSequential()
        .domain(d3.extent(data, d => d.studytime))
        .interpolator(d3.interpolateTurbo);

    const path = d => d3.line()(dimensions.map(p => [x(p), y[p](d[p])]));

    svg.selectAll("path")
        .data(data)
        .enter().append("path")
        .attr("d", path)
        .attr("fill", "none")
        .attr("stroke", d => colorScale(d.studytime))
        .attr("stroke-width", 1.5)
        .attr("opacity", 0.8);

    // Axes
    svg.selectAll(".axis")
        .data(dimensions)
        .enter().append("g")
        .attr("class", "axis")
        .attr("transform", d => `translate(${x(d)})`)
        .each(function (d) {
            d3.select(this).call(d3.axisLeft().scale(y[d]));
        })
        .append("text")
        .style("text-anchor", "middle")
        .attr("y", -9)
        .text(d => d)
        .style("fill", "black")
        .style("font-size", "12px");

    // Title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + 40)
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .style("font-weight", "bold")
        .style("fill", "black")
        .text("Links between studytime, freetime, going out, and drinking");
});