function get_info_on_var(variable) {
    var rel_meta = meta_data.find(function(d) {
        return d.Variabele == variable;
    })
    var label = rel_meta['Label_1'];
    var definition = rel_meta['Definition'];

    return [label, definition]
}

function updateArea(selectObject) {
    selected_area = selectObject.value;
    updatePlot(selected_area);
};

// Make sure to update plot (first time opening shows Centrum-West as default)
function updatePlot(selected_area) {
    if (!selected_area) {
        selected_area = "Centrum-West"
    }
    var fetch_url = "/d3_plot_data?area_name=" + selected_area;
    fetch(fetch_url)
        .then(function(response) { return response.json(); })
        .then((data) => {
            plot_data = data;
            removeOldPie();
            createNewPie(selected_area);
    });
}

function removeOldPie() {
    d3.select("#pie_group")
        .remove();
}

function createNewPie(selected_area) {
    var width = 750
        height = 750
        margin = 40

    // Most of this code is directly copy-pasted from the d3 source of piechart (slight differences in implementations to get it working)
    var pie_group = svgContainer1.append("g")
                    .attr("id", "pie_group")
                    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    var radius = Math.min(width, height) / 2 - margin

    var color = d3.scaleOrdinal()
                    .domain(["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K"])
                    .range(["gold", "cyan", "black", "maroon", "beige", "teal", "grey", "magenta", "orange", "lime", "slateblue", "red"]);

    var pie = d3.pie()
                .sort(null) // Do not sort group by size
                .value(function(d) {return d.value; })
                
    var data_ready = pie(d3.entries(plot_data[0]))

    // The arc generator
    var arc = d3.arc()
    .innerRadius(radius * 0.5)         // This is the size of the donut hole
    .outerRadius(radius * 0.8)

    var outerArc = d3.arc()
                    .innerRadius(radius * 0.9)
                    .outerRadius(radius * 0.9)

    pie_group
        .selectAll('allSlices')
        .data(data_ready)
        .enter()
        .append('path')
        .attr('d', arc)
        .attr('fill', function(d){ return(color(d.value)) })
        .attr("stroke", "white")
        .style("stroke-width", "2px")
        .style("opacity", 0.7)
        // Make sure to see details when mouse is at slice
        .on("mouseover", function(d) {
            var x_var = d.data.key;
            var value = d.data.value;
            var info = get_info_on_var(x_var);
            var label = info[0]
            var definition = info[1];
    
            displayTooltip("<b>Label: </b>" + d.data.key + "<br /><b>Variable: </b>" + label + "<br /><b>Percentage: </b>" + 
                value + "%<br /><b>Explanation: </b>" + definition)
    
        })
        // Make sure to see details when moving over slice
        .on("mousemove", function(d, i) {
            var x_var = d.data.key;
            var value = d.data.value;
            var info = get_info_on_var(x_var);
            var label = info[0]
            var definition = info[1];
    
            displayTooltip("<b>Label: </b>" + d.data.key + "<br /><b>Variable: </b>" + label + "<br /><b>Percentage: </b>" + 
                value + "%<br /><b>Explanation: </b>" + definition)
    
        })
        // Make sure to hide when mouse leaves pie chart
        .on("mouseout", function(d) {
            hideTooltip();
        });

    // Add lines
    pie_group
        .selectAll('allPolylines')
        .data(data_ready)
        .enter()
        .append('polyline')
          .attr("stroke", "black")
          .style("fill", "none")
          .attr("stroke-width", 1)
          .attr('points', function(d) {
            var posA = arc.centroid(d) // line insertion in the slice
            var posB = outerArc.centroid(d) // line break: we use the other arc generator that has been built only for that
            var posC = outerArc.centroid(d); // Label position = almost the same as posB
            var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2 // we need the angle to see if the X position will be at the extreme right or extreme left
            posC[0] = radius * 0.95 * (midangle < Math.PI ? 1 : -1); // multiply by 1 or -1 to put it on the right or on the left
            return [posA, posB, posC]
          })
    
    // Add labels
    pie_group
          .selectAll('allLabels')
          .data(data_ready)
          .enter()
          .append('text')
            .text( function(d) { return d.data.key } )
            .style("font-size", "13px")
            .style("text-anchor", "middle")
            .attr('transform', function(d) {
                var pos = outerArc.centroid(d);
                var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
                pos[0] = radius * 0.99 * (midangle < Math.PI ? 1 : -1);
                return 'translate(' + pos + ')';
            })

    // Add text above pie chart
    pie_group.append("text")
            .attr("class", "title")
            .attr("id", "pie-title")
            .attr("y", -325)
            .attr("x", -75)
            .style("font-weight", "bold") 
            .style("font-size", 20)              
            .style("text-anchor", "middle")
            .text("Rental statistics of: ");
    
    // Add text above pie chart
    pie_group.append("text")
            .attr("class", "title")
            .attr("id", "pie-title")
            .attr("y", -325)
            .attr("x", 25)
            // .style("font-weight", "bold") 
            .style("font-size", 20)              
            .style("text-anchor", "left")
            .text(selected_area);
}
