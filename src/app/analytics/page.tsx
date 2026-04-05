"use client";
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import factories from '@/data/factories.json';
import { Card, CardContent } from '@/components/ui/card';

export default function AnalyticsPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Build graph data
    const nodes = factories.map(f => ({ id: f.id, name: f.name, city: f.city, category: f.category }));
    const links: any[] = [];
    
    // Create random mock links between factories based on waste_out -> waste_in matches
    for (let i = 0; i < factories.length; i++) {
        for (let j = i + 1; j < factories.length; j++) {
            const hasMatch = factories[i].waste_out.some((w: string) => factories[j].waste_in.includes(w)) ||
                             factories[j].waste_out.some((w: string) => factories[i].waste_in.includes(w));
            if (hasMatch && Math.random() > 0.5) {
                links.push({
                    source: factories[i].id,
                    target: factories[j].id,
                    value: Math.floor(Math.random() * 5000) + 500
                });
            }
        }
    }

    const width = containerRef.current.clientWidth;
    const height = 600;

    const svg = d3.select(containerRef.current)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height] as any)
      .attr('style', 'max-width: 100%; height: auto;');

    svg.selectAll("*").remove();

    const simulation = d3.forceSimulation(nodes as any)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2));

    const link = svg.append("g")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", "#a78bfa")
      .attr("stroke-width", d => Math.sqrt(d.value) / 10);

    const color = d3.scaleOrdinal()
      .domain(["Manufacturing", "Chemical", "Textile", "Auto"])
      .range(["#00e5b0", "#a78bfa", "#fb7185", "#fbbf24"]);

    const node = svg.append("g")
      .attr("stroke", "#0d1318")
      .attr("stroke-width", 1.5)
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("r", 8)
      .attr("fill", (d: any) => color(d.category) as string)
      .style('cursor', 'pointer')
      .on("click", (event, d) => {
        setSelectedNode(d);
        // Highlight edges
        link.attr("stroke", l => (l.source.id === d.id || l.target.id === d.id) ? "#00e5b0" : "#a78bfa")
            .attr("stroke-opacity", l => (l.source.id === d.id || l.target.id === d.id) ? 1 : 0.1);
      });

    node.append("title")
      .text((d: any) => d.name);

    // Add labels
    const text = svg.append("g")
      .selectAll("text")
      .data(nodes)
      .join("text")
      .attr("dx", 12)
      .attr("dy", ".35em")
      .text((d: any) => d.name)
      .attr("font-size", "10px")
      .attr("fill", "#ededed")
      .attr("font-family", "Space Mono");

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node
        .attr("cx", (d: any) => d.x)
        .attr("cy", (d: any) => d.y);

      text
        .attr("x", (d: any) => d.x)
        .attr("y", (d: any) => d.y);
    });

    return () => {
      simulation.stop();
      svg.remove();
    };
  }, []);

  return (
    <div className="flex-1 flex flex-col p-6 space-y-6 max-w-7xl mx-auto w-full">
      <h1 className="text-3xl font-sans font-bold text-foreground">Symbiosis <span className="text-teal-accent">Network</span></h1>
      <p className="text-muted-foreground font-mono">Live visualization of circular material flows across India.</p>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card className="overflow-hidden border-teal-accent/20 bg-surface/50">
            <CardContent className="p-0">
               <div ref={containerRef} className="w-full h-[600px] relative">
                 {/* D3 injects here */}
               </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-4">
          <Card className="h-full border-purple-accent/20">
             <CardContent className="p-6">
               <h3 className="font-bold text-lg mb-4 text-purple-accent border-b border-purple-accent/20 pb-2">Factory Details</h3>
               
               {selectedNode ? (
                 <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div>
                      <span className="text-xs text-muted-foreground font-mono">Name</span>
                      <p className="text-foreground font-bold">{selectedNode.name}</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground font-mono">Location</span>
                      <p className="text-foreground">{selectedNode.city}</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground font-mono">Category</span>
                      <p className="text-foreground">{selectedNode.category}</p>
                    </div>
                 </div>
               ) : (
                 <p className="text-muted-foreground text-sm flex items-center justify-center h-40 text-center font-mono">
                    Click a node on the graph to view details and highlight its active exchange edges.
                 </p>
               )}
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
