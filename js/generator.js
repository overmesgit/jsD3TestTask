// Класс для создания иерархической структуры, слева направа, сверху вниз
// Работает посредсвом вычисления левой нижней границы структуры и последующим отображением
// остальных элементов правее и выше

// Работает со структурами вида:
// {id: 1, text: "Аинз Оал Гоун", hidden: true, helpers: [
//		{id: 12, text: "Помошник Семен"}
//	],
//	children: [
//		{id: 2, text: "Аура Белла", hidden: true}
//	]
// }
// helpers не могут содержать children

function D3GraphGenerator(inputNodes) {
    this.data = {};

    this.init = init;
    this.generate = generate;
    this.update = generate;
    this.addLines = addLines;
    this.nodeCreator = nodeCreator;
    this.rootNodePrepare = rootNodePrepare;
    this.addHelpersNodes = addHelpersNodes;
    this.graphWalker = graphWalker;

    this.nodeWidth = 140;
    this.nodeHeight = 40;
    this.nodeMargin = 20;
    this.levelMargin = 30;
    this.helperMargin = this.levelMargin / 2;
    this.helperLeftMargin = 10;
    this.nodeHeightWithMargin = this.nodeHeight + this.levelMargin;
    this.nodeHeightWithHelperMargin = this.nodeHeight + this.helperMargin;
    this.nodeWidthWithMargin = this.nodeWidth + this.nodeMargin;
    this.lineNodeMargin = 10;

    function init() {
        this.data = {nodes: [], lines: [], nextX: 10};
    }

    function generate(root) {
        this.init();

        // Рекурсивный обходчик данных
        this.graphWalker(root, null, 0, this.nodeCreator.bind(this), this.rootNodePrepare.bind(this), null);

        return this.data;
    }

    function addLines(node, parent, d3node, levelData, data) {
        // Добавляет в data.lines линии для ноды, вертикальную линию сверху(если есть родитель),
        // вертикальную линию снизу если есть потомок или помошник
        // горизонтальную линию с которой соединяются потомки
        // линию слева для помошников

        var nodeCenter = d3node.x + this.nodeWidth / 2;
        var nodeBottom = d3node.y + this.nodeHeight;

        if (node.helpers && !node.hidden) {
            var helperLineY = 0;
            //линии слева для нодов помошников
            node.helpers.forEach(function (node) {
                var d3node = node.d3node;
                helperLineY = d3node.y + this.nodeHeight / 2;
                this.data.lines.push({
                    x1: nodeCenter, y1: helperLineY,
                    x2: nodeCenter + this.helperLeftMargin, y2: helperLineY, id: "helper" + node.id
                })
            }, this)

            if (!node.children) {
                //хвост без дочерних с помошниками
                this.data.lines.push({
                    x1: nodeCenter,
                    y1: nodeBottom,
                    x2: nodeCenter,
                    y2: helperLineY,
                    id: "tail" + node.id
                })
            }
        }


        if (node.children && !node.hidden) {
            var helpersHeight = 0;
            if (node.helpers) {
                helpersHeight = node.helpers.length * this.nodeHeightWithHelperMargin;
            }

            var lineY = d3node.y + this.lineNodeMargin + this.nodeHeight + helpersHeight;
            if (node.children.length > 1) {
                var lineX1 = levelData.leftBound + this.nodeWidth / 2;
                var lineX2 = levelData.rightBound - this.nodeWidth / 2;

                //горизонтальная линия
                this.data.lines.push({x1: lineX1, y1: lineY, x2: lineX2, y2: lineY, id: "horizon" + node.id});
            }

            //хвост с дочерними
            this.data.lines.push({x1: nodeCenter, y1: nodeBottom, x2: nodeCenter, y2: lineY, id: "tail" + node.id});
        }

        //голова
        if (parent) {
            this.data.lines.push({
                x1: nodeCenter,
                y1: d3node.y - this.levelMargin + this.lineNodeMargin,
                x2: nodeCenter,
                y2: d3node.y,
                id: "head" + node.id
            })
        }

    }

    function rootNodePrepare(node, parent, level, parentLevelData, levelData) {
        //вычисляем верхнюю границу уровня

        //top offset
        var y = 20;
        if (parent) {
            y = parentLevelData.y + this.nodeHeightWithMargin;
            if (parent.helpers) {
                y += parent.helpers.length * this.nodeHeightWithHelperMargin;
            }
        }

        levelData.y = y;
    }

    function nodeCreator(node, parent, level, parentLevelData, levelData) {
        //Создает ноду для d3 с правильными координатами, путем отслеживания местоположение для следующей ноды
        //ВАЖНО: для правильной работы обработка родительской ноды должена следовать после обработки потомков
        //Потомки идут друг за другом в линию
        //Родитель располагается над потомками по середине

        var x = this.data.nextX;
        var y = levelData.y;
        if (node.children && !node.hidden) {
            //для родительских нод х вычисляется относительно потомков
            var nodeCenter = (levelData.rightBound + levelData.leftBound) / 2;
            x = nodeCenter - this.nodeWidth / 2;

        } else {
            //для нижних нод х берется больше предыдущей колонки
            x = this.data.nextX;
            this.data.nextX += this.nodeWidthWithMargin;
        }
        var d3node = {
            x: x,
            y: y,
            text: node.text,
            source: node,
            previous: node.d3node,
            width: this.nodeWidth,
            height: this.nodeHeight
        };

        if (parent) {
            if (!parentLevelData.leftBound) {
                parentLevelData.leftBound = d3node.x;
            }
            parentLevelData.rightBound = d3node.x + this.nodeWidth;
        }

        this.data.nodes.push(d3node);
        node.d3node = d3node;

        this.addHelpersNodes(node, d3node);

        this.addLines(node, parent, d3node, levelData);

    }

    function addHelpersNodes(node, d3node) {
        if (node.helpers && !node.hidden) {
            var helperX = d3node.x + this.nodeWidth / 2 + this.helperLeftMargin;
            node.helpers.forEach(function (helper, i) {
                helperd3node = {
                    x: helperX,
                    y: d3node.y + (i + 1) * (this.nodeHeightWithHelperMargin),
                    text: helper.text, source: helper,
                    previous: helper.d3node,
                    width: this.nodeWidth, height: this.nodeHeight
                };
                this.data.nodes.push(helperd3node);
                helper.d3node = helperd3node;
            }, this);
            //Если ноды помошников не влезают из-за достаточного количества потомков сдвигаем следующий X
            if (helperX > this.data.nextX - this.nodeWidthWithMargin) {
                this.data.nextX = helperX + this.nodeWidthWithMargin;
            }
        }
    }

    function graphWalker(node, parent, level, nodeHandler, rootHandler, parentLevelData) {
        //Рекурсивно обходит ноды у которых не скрыты потомки и вызывает переданный обработчик для каждой
        //Сначала обработчик вызывается для потомков, потом для родителя
        //Есть метод, которые сначала вызывается для родительской ноды

        //Для каждого уровня создается свой словарь с данными
        var levelData = {};

        rootHandler(node, parent, level, parentLevelData, levelData);

        if (node.children && !node.hidden) {
            node.children.forEach(function (child) {
                this.graphWalker(child, node, level + 1, nodeHandler, rootHandler, levelData);
            }, this);
        }
        nodeHandler(node, parent, level, parentLevelData, levelData);
    }

}
