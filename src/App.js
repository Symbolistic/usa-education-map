import React, { useEffect } from 'react';
import './App.css';
import * as d3 from "d3"
import * as topojson from 'topojson-client'
import { scaleLinear, color, text } from 'd3';


function App() {

  useEffect(() => {

    async function getData() {
      const responses = await Promise.all([fetch("https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json"), fetch("https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json")]);
      const [counties, userEd] = await Promise.all(
        responses.map(response => response.json())
      );
      renderD3(counties, userEd)
    }
      
    getData()

  }, [])



  return (
    <div className="container">
      <h1 id="title">United States Educational Attainment</h1>
      <h2 id="description">Percentage of adults age 25 and older with a bachelor's degree or higher (2010-2014)</h2>
      <div id="map"></div>
      <div id="legend" className="legend"></div>
    </div>
  );
}

const renderD3 = (dataMap, dataEdu) => {
  if (dataEdu.length > 0) {
    let margin = { top: 0, left: 0, right: 0, bottom: 0 };
    let height = 600 - margin.top - margin.bottom
    let width = 1000 - margin.left - margin.right;


    let svg = d3.select("#map")
                .append("svg")
                .attr("height", height + margin.top + margin.bottom)
                .attr("width", width + margin.left + margin.right)
                .append('g')
                .attr("transform", `translate(${margin.left}, ${margin.top})`);



    let path = d3.geoPath()



    const colorScale = scaleLinear()
                        .domain([3, 12, 21, 30, 39, 48, 57, 66])
                        .range(["#8F9FB3", "#8F9FB3", "#788CA3", "#627994", "#4B6585", "#355275", "#1E3F66"])


    // X Axis for ColorScale Legend
    let xAxis = d3.axisBottom(colorScale)

    const legendScale = scaleLinear()
                        .domain([3, 12, 21, 30, 39, 48, 57, 66])
                        .range([3, 12, 21, 30, 39, 48, 57, 66])


    let legend = d3.select(".legend")
                   .append('svg')
                   .attr("class", "legend")
                  


    legend.selectAll(".color")
          .data([3, 12, 21, 30, 39, 48, 57, 66])
          .join("rect")
          .attr("class", "color")
          .attr("height", 20)
          .attr("width", 50)
          .attr("fill", value => colorScale(value))
          .attr("x", value => legendScale(value)+90)
  
    legend.append('g')
          .append('text')
          .text("Dark = High %")
          .attr("x", 100)
          .attr('y', 39)

    
    let div = d3.select(".container").append('div')
                        .attr("class", "tooltip")
                        .attr("id", "tooltip")
                        .style("opacity", 0);
    
    
    let states = topojson.feature(dataMap, dataMap.objects.states).features


    svg.selectAll(".state")
       .data(states)
       .enter().append("path")
       .attr("class", "state")
       .attr('d', path)
       .attr("stroke", "white")


    
   let counties = topojson.feature(dataMap, dataMap.objects.counties).features

   svg.selectAll(".county")
      .data(counties)
      .enter().append("path")
      .attr("class", "county")
      .attr("data-fips", value => {
        let countyEdu = dataEdu.find(data => {
          return data.fips === value.id
        })
          return countyEdu.fips
      })
      .attr("data-education", value => {
        let countyEdu = dataEdu.find(data => {
          return data.fips === value.id
        })
        return countyEdu.bachelorsOrHigher
      })
      .attr('d', path)
      .attr("fill", value => {
        let countyEdu = dataEdu.find(data => {
          return data.fips === value.id
        })
        return colorScale(countyEdu.bachelorsOrHigher)
      })
      .on("mouseover", value => {
        let countyEdu = dataEdu.find(data => {
          return data.fips === value.id
        })
        div.style("opacity", 0.9)
        div.html(countyEdu.area_name + ', ' + countyEdu.state + ': ' + Math.round(countyEdu.bachelorsOrHigher) + '%')
           .style("left", (d3.event.pageX) + "px")
           .style("top", (d3.event.pageY - 80) + "px");

        div.attr("data-education", () => {
          let countyEdu = dataEdu.find(data => {
            return data.fips === value.id
          })
          return countyEdu.bachelorsOrHigher
        })
      })
      .on("mouseleave", () => { div.style("opacity", 0) .style('top', 0)})



  }
}

export default App;
