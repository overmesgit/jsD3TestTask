var root = {id: 1, text: "Аинз Оал Гоун", hidden: true, helpers: [{id: 12, text: "Помошник Семен", isHelper: true}], children: [
	{id: 2, text: "Аура Белла", hidden: true},
	{id: 3, text: "Солюшн", hidden: true, children: [
		{id: 4, text: "Коцит", hidden: true, children: [
			{id: 5, text: "Маура Белла", hidden: true}, {id: 6, text: "Пандора", hidden: true}
			]}
		]},
	{id: 7, text: "Шалти Бладфолен", helpers: [{id: 13, text: "Ночной народ", isHelper: true}], hidden: true},
	{id: 8, text: "Демиург", hidden: true, children: [
		{id: 9, text: "Себастьян", hidden: true},{id: 10, text: "Альбедо", hidden: true}
	]},
	{id: 11, text: "Нигредо", hidden: true}
]};

d3.select("svg").remove();
d3.select("body").append("svg");
var nextId = 1000;
var duration = 300;

var graphGenerator = new D3GraphGenerator();

document.getElementById('button-random-add').onclick = addRandomNode;
update();

function update() {
	var data = graphGenerator.generate(root);
	renderNodesAndLines(data);
	var vis = d3.select("svg");
	vis.selectAll("rect, text")
		.on('click', function (data, index) {
			if (data.source.hidden) {
				showNode(data.source)
			} else {
				hideNode(data.source);
			}
			update();
		})
}

function addRandomNode(event) {
	var notHelperNodeIndexes = [];
	graphGenerator.data.nodes.forEach(function (node, i) {
		if ( !node.source.isHelper ) {
			notHelperNodeIndexes.push(i);
		}
	});
	var randomNodeIndex = notHelperNodeIndexes[Math.floor( Math.random() * notHelperNodeIndexes.length)];
	var source = graphGenerator.data.nodes[randomNodeIndex].source;
	source.hidden = false;
	if (Math.random() > 0.5) {
		if (!source.children) { source.children = []; }
		source.children.push({id: nextId, hidden: false, text: "Random " + randomNodeIndex});
	} else {
		if (!source.helpers) { source.helpers = []; }
		source.helpers.push({id: nextId, isHelper: true, text: "Random " + randomNodeIndex});
	}
	
	nextId++;
	update();
}

function showNode(node) {
	node.hidden = !node.hidden;
}	

function hideNode(node) {
	node.hidden = true;
	if (node.children) {
		node.children.forEach(this.hideNode);
	}
}

function renderNodesAndLines(data) {
	renderNodes(data.nodes);
	renderText(data.nodes);
	renderLines(data.lines);
}

function renderText(nodes) {
	var vis = d3.select("svg");
	var d3text = vis.selectAll("text")
	   .data(nodes, function(d) { return d.source.id; });
	   
	d3text.transition()
       .duration(duration)
       .attr("x", function(d) { return d.x + 5; })
	   .attr("y", function(d) { return d.y + 20; });
	
	d3text.enter()
	   .append("text")
	   .attr("fill-opacity", 0)
	   .attr("x", function(d) { return d.x + 5; })
	   .attr("y", function(d) { return d.y + 20; })
	   .text(function(d) { return d.text; })
	   .attr("fill", "black")
	   .transition()
	   .duration(duration)
	   .attr("fill-opacity", 1);

	d3text.exit()
		.remove()
}

function renderLines(lines) {
	var vis = d3.select("svg");
	var d3lines = vis.selectAll("line")
	   .data(lines, function (d) { return d.id; });
	   
	d3lines.transition()
       .duration(duration)
	   .attr("x1", function(d) { return d.x1; })
	   .attr("y1", function(d) { return d.y1; })
	   .attr("x2", function(d) { return d.x2; })
	   .attr("y2", function(d) { return d.y2; });
	   
   d3lines.enter()
	   .append("line")
	   .attr("x1", function(d) { return d.x1; })
	   .attr("y1", function(d) { return d.y1; })
	   .attr("x2", function(d) { return d.x1; })
	   .attr("y2", function(d) { return d.y1; })
	   .style("stroke", "rgb(6,120,155)")
	   .transition()
       .duration(duration)
       .attr("x2", function(d) { return d.x2; })
	   .attr("y2", function(d) { return d.y2; });
	   
   d3lines.exit()
	   .transition()
       .duration(duration)
	   .attr("x1", function(d) { return d.x1; })
	   .attr("y1", function(d) { return d.y1; })
	   .attr("x2", function(d) { return d.x1; })
	   .attr("y2", function(d) { return d.y1; })
	   .remove();
}

function renderNodes(nodes) {
	var vis = d3.select("svg");
	var d3rect = vis.selectAll("rect")
	   .data(nodes, function(d) { return d.source.id; });
	   
   d3rect.transition()
       .duration(duration)
       .attr("x", function(d) { return d.x; })
	   .attr("y", function(d) { return d.y; });
	   
   d3rect.enter()
	   .append("svg:rect")
	   .attr("x", function(d) { return d.x; })
	   .attr("width", 0)
	   .attr("y", function(d) { return d.y; })
	   .attr("height", 0)
	   .attr("rx", 10)
	   .attr("ry", 10)
	   .transition()
       .duration(duration)
	   .attr("width", function(d) { return d.width; })
	   .attr("height", function(d) { return d.height; });
	   
	d3rect.exit()
       .transition()
       .duration(duration)
       .attr("width", 0)
       .attr("height", 0)
       .remove()
}
