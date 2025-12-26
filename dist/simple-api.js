"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createChart = createChart;
var d3_selection_1 = require("d3-selection");
var api_1 = require("./api");
var data_1 = require("./data");
var DEFAULT_SVG_SELECTOR = 'svg';
function createChartOptions(chartOptions, renderOptions, options) {
    var data = new data_1.JsonDataProvider(chartOptions.json);
    var indiHrefFunc = chartOptions.indiUrl
        ? function (id) { return chartOptions.indiUrl.replace('${id}', id); }
        : undefined;
    var famHrefFunc = chartOptions.famUrl
        ? function (id) { return chartOptions.famUrl.replace('${id}', id); }
        : undefined;
    // If startIndi nor startFam is provided, select the first indi in the data.
    if (!renderOptions.startIndi && !renderOptions.startFam) {
        renderOptions.startIndi = chartOptions.json.indis[0].id;
    }
    var animate = !options.initialRender && chartOptions.animate;
    var renderer = new chartOptions.renderer({
        data: data,
        indiHrefFunc: indiHrefFunc,
        famHrefFunc: famHrefFunc,
        indiCallback: chartOptions.indiCallback,
        indiDblCallback: chartOptions.indiDblCallback,
        indiRightCallback: chartOptions.indiRightCallback,
        famCallback: chartOptions.famCallback,
        horizontal: chartOptions.horizontal,
        colors: chartOptions.colors,
        animate: animate,
        locale: chartOptions.locale,
    });
    return {
        data: data,
        renderer: renderer,
        startIndi: renderOptions.startIndi,
        startFam: renderOptions.startFam,
        svgSelector: chartOptions.svgElement || chartOptions.svgSelector || DEFAULT_SVG_SELECTOR,
        horizontal: chartOptions.horizontal,
        baseGeneration: renderOptions.baseGeneration,
        animate: animate,
        expanders: chartOptions.expanders,
    };
}
var SimpleChartHandle = /** @class */ (function () {
    function SimpleChartHandle(options) {
        this.options = options;
        this.initialRender = true;
        this.collapsedIndi = new Set();
        this.collapsedSpouse = new Set();
        this.collapsedFamily = new Set();
    }
    SimpleChartHandle.prototype.render = function (renderOptions) {
        var _this = this;
        if (renderOptions === void 0) { renderOptions = {}; }
        this.chartOptions = createChartOptions(this.options, renderOptions, {
            initialRender: this.initialRender,
        });
        this.chartOptions.collapsedFamily = this.collapsedFamily;
        this.chartOptions.collapsedIndi = this.collapsedIndi;
        this.chartOptions.collapsedSpouse = this.collapsedSpouse;
        this.chartOptions.expanderCallback = function (id, direction) {
            return _this.expanderCallback(id, direction, renderOptions);
        };
        this.initialRender = false;
        var chart = new this.options.chartType(this.chartOptions);
        var info = chart.render();
        if (this.options.updateSvgSize !== false && this.chartOptions.svgSelector) {
            var svgSelection = void 0;
            if (typeof this.chartOptions.svgSelector === 'string') {
                svgSelection = (0, d3_selection_1.select)(this.chartOptions.svgSelector);
            }
            else { // It must be an SVGElement
                svgSelection = (0, d3_selection_1.select)(this.chartOptions.svgSelector);
            }
            svgSelection
                .attr('width', info.size[0])
                .attr('height', info.size[1]);
        }
        return info;
    };
    SimpleChartHandle.prototype.expanderCallback = function (id, direction, renderOptions) {
        var set = direction === api_1.ExpanderDirection.FAMILY
            ? this.collapsedFamily
            : direction === api_1.ExpanderDirection.INDI
                ? this.collapsedIndi
                : this.collapsedSpouse;
        if (set.has(id)) {
            set.delete(id);
        }
        else {
            set.add(id);
        }
        this.render(renderOptions);
    };
    /**
     * Updates the chart input data.
     * This is useful when the data is dynamically loaded and a different subset
     * of data will be displayed.
     */
    SimpleChartHandle.prototype.setData = function (json) {
        this.options.json = json;
    };
    return SimpleChartHandle;
}());
function createChart(options) {
    return new SimpleChartHandle(options);
}
