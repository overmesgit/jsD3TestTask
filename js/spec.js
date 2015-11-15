describe("vertical test", function() {
  it("contains spec with an expectation", function() {
	  var root = {id: 1, text: "1111", hidden: false, children: [
		{id: 2, text: "222 1111", hidden: false},
		{id: 3, text: "22222 22", hidden: false, children: [
			{id: 4, text: "2222 3311", hidden: false, children: [
				{id: 5, text: "111 4411", hidden: true}, {id: 6, text: "111 444 22", hidden: true}
				]}
			]},
		{id: 7, text: "2222 333", hidden: false},
		{id: 8, text: "22224 444", hidden: false, children: [
			{id: 9, text: "4444 333111", hidden: true},{id: 10, text: "444 33 222", hidden: true}
		]},
		{id: 11, text: "2225 555", hidden: false},
	  ]}
	  var graphGenerator = new D3GraphGenerator();
	  var data = graphGenerator.generate(root);
	  
	  expect(root.children[0].d3node.x).toBe(10);
	  expect(root.children[0].d3node.y).toBe(90);
	  
	  expect(root.children[4].d3node.x).toBe(970);
	  expect(root.children[4].d3node.y).toBe(90);
		
  });
});
