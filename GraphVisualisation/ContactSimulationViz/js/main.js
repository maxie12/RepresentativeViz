//Note: This code is rather ugly as it grew organically from something much smaller. A refactored and slightly more optimized
//version is available  when using real data instead of simulated data under the name TTPRepresentativeViz on github, 
//but it does not have full backward compatibility. In particular it assumes some additional data is present, 
//and policies are not explicitely supported. While the code below can be used as it, in case one wants to further develop
//the code to support additional features my recommendation would be the merge back the updated code base first to assist in developement.


const repTreesDataInputLocation = "data/SimulatedData/RepTreesRTDistancePartial.json";
const allTreesDataInputLocation = "data/SimulatedData/AllTrees.json";
const metaDataInputLocation = "data/SimulatedData/NodesAndMeta.json";
const simMetaDataInputLocation = "data/SimulatedData/SimMeta.json";
// const originalExposedDataInputLocation = "data/SimulatedData/Backup/OriginalExposed.csv"

//Visual variables
//Variables for the tree visualization
let nodeBaseSize = 4; //radius of the node
let linkBaseSize; //Width of links
let verNodeSpace; //vertical space between nodes
let horNodeSpace; //horitonzal space between nodes
let marginWithinTree; //margin between the trees
let horizontalMarginBetweenTrees; //Horizontal space between trees.
let fontSizeRepAmount; //Base font size for the number that tells how much is represented



function setVizSizes(nodeSize) {
    nodeBaseSize = nodeSize;
    linkBaseSize = nodeSize / 2; //constant link size depending on node size
    verNodeSpace = nodeSize * 2 + 3; //Vertical space between nodes. *2 as this is the diamater of a node. 
    horNodeSpace = nodeSize * 2 + 2; // Horizontal space between nodes. *2 as this is the diamater of a node.
    marginWithinTree = nodeSize * 2; //Makes sure the tree doesn't get clipped
    horizontalMarginBetweenTrees = nodeBaseSize * 2;
    fontSizeRepAmount = nodeSize * 2; //Base font size for the number that tells how much is represented

}


//Space for the layout
const verticalMarginBetweenTrees = 4; //Vertical space between trees.
const hiddenTreesScalingFactor = 0.001; //how much the trees that are represented by other trees are scaled down






const initEditDistanceSliderVal = 15; //start the slider at 0
const maxEditDistanceSliderVal = 100;

const popupWidth = 500; //width of the popup when clicking a node to see which trees it represents.

var treeOrder = []; //order of the trees in the viz
var treeBaseWidthById = new Map(); //Base width of the tree by id of the root. Uses nodes of {@code nodeBaseSize} size
var treeBaseHeightById = new Map(); //Base  height of the tree by id of the root. Uses nodes of {@code nodeBaseSize} size

var repTreeById = new Map(); //holds the representative tree data by id of the root
var repNodeById = new Map(); //holds all node data represented by the specified node
var allTreeById = new Map(); //holds the alltree data by id of the root
var metaDataFromNodeById = new Map(); //holds the meta data for each node by id of the node.

var currentEditDistance = initEditDistanceSliderVal; //Current edit distance


var currentLeftColor = "None"; //What we are currently coloring the nodes by for the left sides of the glyphs
var currentRightColor = "None"; //What we are currently coloring the nodes by for the left sides of the glyphs
var currentLeftPolicy = "1a"; //what the current policy is for the left sides of the glyphs
var currentRightPolicy = "1a"; //what the current policy is for the left sides of the glyphs
var currentLeftAppPercentage = "100";
var currentRightAppPercentage = "100";

var sortEnabled = false;
var sortBy = "Tree size";


var recalculate = false; //Holds whether we need to recalculate the tree grid. Can happen in case of node size change or data change

const maxParts = 10; //How many different parts we can have at maximum in the glyph.

var repTreesData, allTreesData, metaData, simMetaData, originalExposedData;
var d3;




//Load in all the javascript files
requirejs(["js/d3/d3.js", "js/ColorSchemes.js", "js/LineChart.js", "js/StackedAreaChart.js", "js/dataQueries.js", "js/stateCounters.js", "js/nodeViz.js", "js/sidePanel.js", "js/treeLayout.js", "js/representativeGraph.js", "js/popup.js", "js/updateFunctions.js", "js/offsetCalculator.js"], function(d3Var) {
    //load in all the data
    d3 = d3Var;
    d3.json(repTreesDataInputLocation).then(function(repTreesDataInput) {
        d3.json(allTreesDataInputLocation).then(function(allTreesDataInput) {
            d3.json(metaDataInputLocation).then(function(metaDataInput) {
                d3.json(simMetaDataInputLocation).then(function(simMetaDataInput) {
                    // d3.csv(originalExposedDataInputLocation).then(function(originalExposedDataInput) {
                    repTreesData = repTreesDataInput;
                    allTreesData = allTreesDataInput;
                    metaData = metaDataInput;
                    simMetaData = simMetaDataInput;
                    // originalExposedData = originalExposedDataInput;
                    setVizSizes(nodeBaseSize);
                    mainRepresentativeGraph();
                    updateAll(); //update to use slider values
                    // });
                });
            });
        });
    });
});


function mainRepresentativeGraph() {

    createSidePanel()

    preprocessData();

    generateTreeGrid();


    window.addEventListener('resize', function() { updatePositions() }, true);

}