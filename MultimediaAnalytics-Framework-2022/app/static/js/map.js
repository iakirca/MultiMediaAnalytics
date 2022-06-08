function drawMap(data,target){
    const svg = d3.select("#map svg"),
        width = +svg.attr("width"),
        height = +svg.attr("height");
    
    // Map and projection
    const projection = d3.geoAlbers()

    // Load external data and boot
        projection.rotate(-75).fitExtent(
	[
		[0, 0],
		[width, height],
	],
	data
    )
        svg.selectAll('*').remove();
        // Draw the map
        svg.append("g")
            .selectAll("path")
            .data(data.features)
            .join("path")
                .attr("fill", function(d){ 
                    if (d.properties["Gebied"]===target) return "#f00";        
                return "#555";
            })
                .attr("class","district")
                .attr("id", function(d){
                return d.id;        
            })
                .attr("d", d3.geoPath()
                .projection(projection)
                )
                .style("stroke", "#fff")

            // Make sure to see the details when mouse is at region
            .on("mouseover", function(d) {
                var gebiedcode = d.properties.Gebiedcode;
                var gebied = d.properties.Gebied;
                var stadsdeelcode = d.properties.Stadsdeelcode;
                var stadsdeel = d.properties.Stadsdeel;
        
                displayTooltip("<b>Stadsdeel: </b>" + stadsdeel + " (" + stadsdeelcode  + ") <br /> <b> Gebied: </b>" + gebied + " (" + gebiedcode + ")")
            })
            // Make sure to see details when mouse moves over map
            .on("mousemove", function(d, i) {
                var gebiedcode = d.properties.Gebiedcode;
                var gebied = d.properties.Gebied;
                var stadsdeelcode = d.properties.Stadsdeelcode;
                var stadsdeel = d.properties.Stadsdeel;
        
                displayTooltip("<b>Stadsdeel: </b>" + stadsdeel + " (" + stadsdeelcode  + ") <br /> <b> Gebied: </b>" + gebied + " (" + gebiedcode + ")")
        
            })
            // If mouse leaves map, hide
            .on("mouseout", function(d) {
                hideTooltip();
            })
            // Make sure to render new details every time a region is clicked
            .on("click", function(d) {
                selected_area = d.properties.Gebied
                updatePlot(selected_area)
                var mapData;
                d3.json("d3_map_data").then( function(data) {
                    mapData= data;
                    drawMap (mapData,selected_area)
                });
            });
    
        // Add text above pie chart
        svg.append("text")
            .attr("class", "title")
            .attr("id", "map-title")
            .attr("y", 45)
            .attr("x", 350)
            .style("font-weight", "bold") 
            .style("font-size", 20)              
            .style("text-anchor", "middle")
            .text("Region selected: ");
        
        // Add text above pie chart
        svg.append("text")
            .attr("class", "title")
            .attr("id", "map-title")
            .attr("y", 45)
            .attr("x", 435)
            // .style("font-weight", "bold") 
            .style("font-size", 20)              
            .style("text-anchor", "left")
            .text(selected_area);
    }