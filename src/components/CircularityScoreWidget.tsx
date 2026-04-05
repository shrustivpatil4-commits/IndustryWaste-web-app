"use client";
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export default function CircularityScoreWidget({ score }: { score: number }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const width = 120;
    const height = 120;
    const margin = 10;
    const radius = Math.min(width, height) / 2 - margin;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const group = svg.append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    // Background Arc
    const backgroundArc = d3.arc<any>()
      .innerRadius(radius - 10)
      .outerRadius(radius)
      .startAngle(0)
      .endAngle(2 * Math.PI);

    group.append("path")
      .attr("d", backgroundArc)
      .attr("fill", "rgba(255,255,255,0.05)");

    // Foreground Arc
    const foregroundArc = d3.arc<any>()
      .innerRadius(radius - 10)
      .outerRadius(radius)
      .startAngle(0)
      .cornerRadius(5);

    const path = group.append("path")
      .datum({ endAngle: 0 })
      .attr("d", foregroundArc)
      .attr("fill", "#00e5b0");

    // Animation transition
    path.transition()
      .duration(1500)
      .attrTween("d", (d: any) => {
        const i = d3.interpolate(d.endAngle, (score / 100) * 2 * Math.PI);
        return function(t: number) {
          d.endAngle = i(t);
          return foregroundArc(d) || "";
        };
      });

    // Score Text
    group.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "0.3em")
      .attr("fill", "#ededed")
      .attr("font-size", "24px")
      .attr("font-family", "Space Mono, monospace")
      .text(`${score}%`);
      
    // Label Text
    group.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "2.5em")
      .attr("fill", "rgba(0,229,176,0.8)")
      .attr("font-size", "9px")
      .attr("font-family", "Space Mono, monospace")
      .text(`City Circularity`);

  }, [score]);

  return (
    <svg ref={svgRef} width={120} height={120} className="mx-auto" />
  );
}
