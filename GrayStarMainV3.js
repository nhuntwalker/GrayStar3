/*
 * The openStar project: stellar atmospheres and spectra
 *
 * grayStar
 * V3.0, May 2015
 * JQuery version
 * 
 * C. Ian Short
 * Saint Mary's University
 * Department of Astronomy and Physics
 * Institute for Computational Astrophysics (ICA)
 * Halifax, NS, Canada
 *  * ian.short@smu.ca
 * www.ap.smu.ca/~ishort/
 * 
 * Open source pedagogical computational stellar astrophysics
 *
 * 1D, static, plane-parallel, LTE, multi-gray stellar atmospheric model
 * Voigt spectral line profile
 *
 * Suitable for pedagogical purposes only
 * 
 * Logic developed in Java SE 8.0, JDK 1.8
 * 
 * Ported to JavaScript for deployment
 *
 * System requirements for Java version: Java run-time environment (JRE)
 * System requirements for JavaScript version: JavaScript intrepretation enabld in WWW browser (usually by default)
 *
 * Code provided "as is" - there is no formal support 
 *
 * Java default license applies:
 * End users may adapt, modify, develop, debug, and deploy at will
 * for academic and othe non-profit uses, but are asked to leave this
 * header text in place (although they may add to the header text).
 *
 */


// **********************************************

"use strict"; //testing only!

// Global variables - Doesn't work - scope not global!

var c = 2.9979249E+10; // light speed in vaccuum in cm/s
var sigma = 5.670373E-5; //Stefan-Boltzmann constant ergs/s/cm^2/K^4  
var wien = 2.8977721E-1; // Wien's displacement law constant in cm K
var k = 1.3806488E-16; // Boltzmann constant in ergs/K
var h = 6.62606957E-27; //Planck's constant in ergs sec
var ee = 4.80320425E-10; //fundamental charge unit in statcoulombs (cgs)
var mE = 9.10938291E-28; //electron mass (g)
var GConst = 6.674e-8; //Newton's gravitational constant (cgs)
//Conversion factors
var amu = 1.66053892E-24; // atomic mass unit in g
var eV = 1.602176565E-12; // eV in ergs
var rSun = 6.955e10; // solar radii to cm
var mSun = 1.9891e33; // solar masses to g
var lSun = 3.846e33; // solar bolometric luminosities to ergs/s
var au = 1.4960e13; // 1 AU in cm

//Methods:
//Natural logs more useful than base 10 logs - Eg. Formal soln module: 
// Fundamental constants
var logC = Math.log(c);
var logSigma = Math.log(sigma);
var logWien = Math.log(wien);
var logK = Math.log(k);
var logH = Math.log(h);
var logEe = Math.log(ee); //Named so won't clash with log_10(e)
var logMe = Math.log(mE);
var logGConst = Math.log(GConst);
//Conversion factors
var logAmu = Math.log(amu);
var logEv = Math.log(eV);
var logRSun = Math.log(rSun);
var logMSun = Math.log(mSun);
var logLSun = Math.log(lSun);
var logAu = Math.log(au);
// ********************************************

//***************************  Main ******************************



function main() {



//**********************************************************



// Intrinsic utility function:
//
// numPrint function to Set up special area of screen for printing out computed values for trouble-shooting 
// requires value to be printed, and the x and y pixel positions in that order
// Must be defined in scope of main() - ??

    var numPrint = function(val, x, y, r255, g255, b255, areaId) {

        var xStr = numToPxStrng(x);
        var yStr = numToPxStrng(y);
        var RGBHex = colHex(r255, g255, b255);
        var valStr = val.toString(10);
        var numId = document.createElement("p");
        numId.style.position = "absolute";
        numId.style.display = "block";
        numId.style.marginTop = yStr;
        numId.style.marginLeft = xStr;
        numId.style.color = RGBHex;
        numId.innerHTML = valStr;
        //masterId.appendChild(numId);
        areaId.appendChild(numId);
    }; // end numPrint

    var txtPrint = function(text, x, y, r255, g255, b255, areaId) {

        var xStr = numToPxStrng(x);
        var yStr = numToPxStrng(y);
        var RGBHex = colHex(r255, g255, b255);
        var txtId = document.createElement("p");
        txtId.style.position = "absolute";
        txtId.style.display = "block";
        txtId.style.width = "500px";
        txtId.style.marginTop = yStr;
        txtId.style.marginLeft = xStr;
        txtId.style.color = RGBHex;
        txtId.innerHTML = text;
        //masterId.appendChild(numId);
        areaId.appendChild(txtId);
    }; // end txtPrint


    /* 
     plotPnt takes in the *numerical* x- and y- DEVICE coordinates (browser pixels), 
     hexadecimal colour, and opacity, and plots a generic plotting dot at that location:
     Calls numToPxStrng to convert numeric coordinates and opacity to style attribute strings for HTML
     Calls colHex to convert R, G, and B amounts out of 255 into #RRGGBB hex format  
     */



    var plotPnt = function(x, y, r255, g255, b255, opac, dSize, areaId) {

        var xStr = numToPxStrng(x);
        var yStr = numToPxStrng(y);
        var opacStr = numToPxStrng(opac);
        var dSizeStr = numToPxStrng(dSize);
        var RGBHex = colHex(r255, g255, b255);
//   var RGBHex = "#000000";


// Each dot making up the line is a separate element:
        var dotId = document.createElement("div");
        dotId.class = "dot";
        dotId.style.position = "absolute";
        dotId.style.display = "block";
        dotId.style.height = dSizeStr;
        dotId.style.width = dSizeStr;
        dotId.style.borderRadius = "100%";
        dotId.style.opacity = opacStr;
        dotId.style.backgroundColor = RGBHex;
        dotId.style.marginLeft = xStr;
        dotId.style.marginTop = yStr;
//Append the dot to the plot
        //masterId.appendChild(dotId);
        areaId.appendChild(dotId);
    };
    /* 
     plotLin takes in the *numerical* x- and y- DEVICE coordinates (browser pixels)
     OF TWO SUGGESSIVE DATA POITNS defining a line segment, 
     hexadecimal colour, and opacity, and plots a generic plotting dot at that location:
     Calls numToPxStrng to convert numeric coordinates and opacity to style attribute strings for HTML
     Calls colHex to convert R, G, and B amounts out of 255 into #RRGGBB hex format  
     */



    var plotLin = function(x0, y0, x1, y1, r255, g255, b255, opac, dSize, areaId) {

        // Parameters of a straight line - all that matters here is internal self-consistency:
        var slope = (y1 - y0) / (x1 - x0);
        var num = x1 - x0;
        var x, y, iFloat;
        for (var i = 0; i < num; i += 5) {
            iFloat = 1.0 * i;
            x = x0 + i;
            y = y0 + i * slope;
            var xStr = numToPxStrng(x);
            var yStr = numToPxStrng(y);
            var opacStr = numToPxStrng(opac);
            var dSizeStr = numToPxStrng(dSize);
            var RGBHex = colHex(r255, g255, b255);
//   var RGBHex = "#000000";


// Each dot making up the line is a separate element:
            var dotId = document.createElement("div");
            dotId.class = "dot";
            dotId.style.position = "absolute";
            dotId.style.display = "block";
            dotId.style.height = dSizeStr;
            dotId.style.width = dSizeStr;
            dotId.style.borderRadius = "100%";
            dotId.style.opacity = opacStr;
            dotId.style.backgroundColor = RGBHex;
            dotId.style.marginLeft = xStr;
            dotId.style.marginTop = yStr;
//Append the dot to the plot
            //masterId.appendChild(dotId);
            areaId.appendChild(dotId);
        }
    };
    /*
     colHex takes in red, green, and blue (in that order!) amounts out of 255 and converts
     them into stringified #RRGGBB format for HTML 
     */


    var colHex = function(r255, g255, b255) {



        var rr = Math.floor(r255); //MUST convert to integer
        var gg = Math.floor(g255); //MUST convert to integer
        var bb = Math.floor(b255); //MUST convert to integer

        var RGBHex = "rgb(";
        RGBHex = RGBHex.concat(rr);
        RGBHex = RGBHex.concat(",");
        RGBHex = RGBHex.concat(gg);
        RGBHex = RGBHex.concat(",");
        RGBHex = RGBHex.concat(bb);
        RGBHex = RGBHex.concat(")");
//////    var RGBHex = "rgb(60,80,120)";



        return RGBHex;
    };
// ***********************************

// Input control:



    // Get the checkbox values controlling what's plotted:
//JQuery test code:
//    $("#btnId").click(function() {
    //       alert("Value: " + $("#Teff").val());
    //       //alert("Value: ");
    //   });

    //var settingsId = document.getElementById("settingsId");

    //var settingsId = document.getElementsByTagName("form");
    //var atmosSettingsId = document.getElementById("atmosSettingsId");

    // Button for re-computing everything - if stellar parameters have changed
    var btnId = document.getElementById("btnId");
    btnId.onClick = function() {
    };
//
    //default initializations:

    var ifLineOnly = false;
    if ($("#lineOnly").is(":checked")) {
//console.log("localStorage checked");
        ifLineOnly = true; // checkbox 
    }

    if (typeof (Storage) === "undefined") {
        ifLineOnly = false;
        console.log("No Web Storage support.  Everything will take longer...");
        window.alert("No Web Storage support. Re-setting 'line only' mode OFF");
    }

    //console.log("ifLineOnly " + ifLineOnly);

    //console.log(" settingsId[0].name " + settingsId[0].name + " settingsId[0].value " + settingsId[0].value);
    //console.log(" atmosSettingsId[0].name " + atmosSettingsId[0].name + " atmosSettingsId[0].value " + atmosSettingsId[0].value);
//JQuery:  Independent of order of switches in HTML file?
// Stellar atmospheric parameters
    var numInputs = 19;
//Make settingsId object array by hand:
// setId() is an object constructor
    function setId(nameIn, valueIn) {
        this.name = nameIn;
        this.value = valueIn;
    }
    //
    // settingId will be an array of objects
    var settingsId = [];
    settingsId.length = numInputs;
    //
    //1st version of each is of JQuery-ui round sliders not available
    //var teff = 1.0 * $("#Teff").val(); // K
    //var teff = 1.0 * $("#Teff").roundSlider("getValue");
    //Sigh - IE needs it this way...
    var teffObj = $("#Teff").data("roundSlider");
    var teff = 1.0 * teffObj.getValue();
    //console.log("Teff read: " + teff);
    //var logg = 1.0 * $("#logg").val(); // log cgs
    //var logg = 1.0 * $("#logg").roundSlider("getValue");
    var loggObj = $("#logg").data("roundSlider");
    var logg = 1.0 * loggObj.getValue();
    //var kappaScale = 1.0 * $("#kappaScale").val(); // linear factor
    //var kappaScale = 1.0 * $("#kappaScale").roundSlider("getValue");
    var kappaScaleObj = $("#kappaScale").data("roundSlider");
    var logKappaScale = 1.0 * kappaScaleObj.getValue();
    //var massStar = 1.0 * $("#starMass").val(); // solar masses
    //var massStar = 1.0 * $("#starMass").roundSlider("getValue");
    var massStarObj = $("#starMass").data("roundSlider");
    var massStar = 1.0 * massStarObj.getValue();
// Planetary parameters for habitable zone calculation
    //var greenHouse = 1.0 * $("#GHTemp").val(); // Delta T_Surf boost K
    //var greenHouse = 1.0 * $("#GHTemp").roundSlider("getValue");
    var greenHouseObj = $("#GHTemp").data("roundSlider");
    var greenHouse = 1.0 * greenHouseObj.getValue();
    //var albedo = 1.0 * $("#Albedo").val(); //unitless reflectivity
    //var albedo = 1.0 * $("#Albedo").roundSlider("getValue");
    var albedoObj = $("#Albedo").data("roundSlider");
    var albedo = 1.0 * albedoObj.getValue();
// Representative spectral line and associated atomic parameters
    var lam0 = 1.0 * $("#lambda_0").val(); //nm
    var A12 = 1.0 * $("#A12").val(); // A_12 logarithmic abundance = log_10(N/H_H) = 12
    var logF = 1.0 * $("#logf").val(); // log(f) oscillaotr strength // saturated line
    var chiI1 = 1.0 * $("#chi_I1").val(); // ground state chi_I, eV
    var chiI2 = 1.0 * $("#chi_I2").val(); // ground state chi_I, eV
    var chiL = 1.0 * $("#chi_L").val(); // lower atomic E-level, eV
    var gw1 = 1.0 * $("#gw_1").val(); // ground state state. weight or partition fn (stage I) - unitless
    var gw2 = 1.0 * $("#gw_2").val(); // ground state state. weight or partition fn (stage II) - unitless
    var gwL = 1.0 * $("#gw_L").val(); // lower E-level state. weight - unitless

    var xiT = 1.0 * $("#xi_T").val(); // km/s
    var mass = 1.0 * $("#mass").val(); //amu, Carbon
    var logGammaCol = 1.0 * $("#gammaCol").val(); // log VanderWaals enhancement
    //
    var diskLambda = 1.0 * $("#dskLam").val(); //nm
//    
    settingsId[0] = new setId("<em>T</em><sub>eff</sub>", teff);
    settingsId[1] = new setId("log <em>g</em>", logg);
    settingsId[2] = new setId("<em>&#954</em>", logKappaScale);
    settingsId[3] = new setId("<em>M</em>", massStar);
    settingsId[4] = new setId("<span style='color:green'>GHEff</span>", greenHouse);
    settingsId[5] = new setId("<span style='color:green'><em>A</em></span>", albedo);
    settingsId[6] = new setId("<em>&#955</em><sub>0</sub>", lam0);
    settingsId[7] = new setId("<em>A</em><sub>12</sub>", A12);
    settingsId[8] = new setId("log <em>f</em>", logF);
    settingsId[9] = new setId("<em>&#967</em><sub>I</sub>", chiI1);
    settingsId[10] = new setId("<em>&#967</em><sub>II</sub>", chiI2);
    settingsId[11] = new setId("<em>&#967</em><sub>l</sub>", chiL);
    settingsId[12] = new setId("<em>g</em><sub>I</sub>", gw1);
    settingsId[13] = new setId("<em>g</em><sub>II</sub>", gw2);
    settingsId[14] = new setId("<em>g</em><sub>l</sub>", gwL);
    settingsId[15] = new setId("<em>&#958</em><sub>T</sub>", xiT);
    settingsId[16] = new setId("<em>m</em>", mass);
    settingsId[17] = new setId("<em>&#915</em><sub>Col</sub>", logGammaCol);
    settingsId[18] = new setId("Disk<em>&#955</em><sub>Col</sub>", diskLambda);
    //
    var numPerfModes = 8;
    var switchPerf = "Fast"; //default initialization
    //JQuery:
    //Fast and Real modes are raio switches - mutuallye xclusive:
// Fast: (default)
    if ($("#fastmode").is(":checked")) {
        switchPerf = $("#fastmode").val(); // radio 
    }
//Real:
    if ($("#realmode").is(":checked")) {
        switchPerf = $("#realmode").val(); // radio 
    }
//User select:
    if ($("#usermode").is(":checked")) {
        switchPerf = $("#usermode").val(); // radio 
    }
    //console.log("switchPerf " + switchPerf);
//
//default initializations:
    var ifTcorr = false;
    var ifConvec = false;
    var ifVoigt = false;
    var ifLinePlot = false;
    var ifScatt = false;
    //
    var ifShowAtmos = false;
    var ifShowRad = false;
    var ifShowLine = false;
    //
    var ifPrintNone = true;
    var ifPrintAtmos = false;
    var ifPrintSED = false;
    var ifPrintLDC = false;
    var ifPrintLine = false;
    //
    //

//
//Over-rides:

//console.log("Before overide: switchPerf " + switchPerf + " ifTcorr " + ifTcorr + " ifConvec " + ifConvec + " ifVoigt " + ifVoigt + " ifLinePlot " + ifLinePlot);
//
    if (switchPerf === "Fast") {
//console.log("False branch");
        ifTcorr = false;
        $("#tcorr").removeAttr("checked");
        ifConvec = false;
        $("#convec").removeAttr("checked");
        ifVoigt = false;
        $("#voigt").removeAttr("checked");
        ifLinePlot = false;
        $("#lineplot").removeAttr("checked");
        ifScatt = false;
        $("#scatter").removeAttr("checked");
    }
    if (switchPerf === "Real") {
        //console.log("Real branch");
        ifTcorr = true;
        $("#tcorr").attr("checked", ":checked");
        ifConvec = false;
        ifVoigt = true;
        $("#voigt").attr("checked", ":checked");
        ifLinePlot = true;
        $("#lineplot").attr("checked", ":checked");
        ifScatt = true;
        $("#scatter").attr("checked", ":checked");
    }
    if (switchPerf === "User") {
//console.log("User branch");
//
// Individual modules are checkboxes:
//TCorr:
        if ($("#tcorr").is(":checked")) {
//console.log("Tcorr checked");
            ifTcorr = true; // checkbox 
        }
//Convec:
        if ($("#convec").is(":checked")) {
//console.log("convec checked");
            ifConvec = true; // checkbox
        }
//Voigt:
        if ($("#voigt").is(":checked")) {
//console.log("voigt checked");
            ifVoigt = true; // checkbox
        }
//LinePlot:
        if ($("#lineplot").is(":checked")) {
//console.log("lineplot checked");
            ifLinePlot = true; // checkbox 
        }
//Line scattering:
        if ($("#scatter").is(":checked")) {
//console.log("voigt checked");
            ifScatt = true; // checkbox
        }
    }

    // Display options:
    if ($("#showAtmos").is(":checked")) {
        ifShowAtmos = true; // checkbox
    }
    if ($("#showRad").is(":checked")) {
        ifShowRad = true; // checkbox
    }
    if ($("#showLine").is(":checked")) {
        ifShowLine = true; // checkbox
    }

    //Detailed print-out options:
    if ($("#printNone").is(":checked")) {
        ifPrintNone = true; // checkbox
    }
    if ($("#printAtmos").is(":checked")) {
        ifPrintAtmos = true; // checkbox
    }
    if ($("#printSED").is(":checked")) {
        ifPrintSED = true; // checkbox
    }
    if ($("#printIntens").is(":checked")) {
        ifPrintLDC = true; // checkbox
    }
    if ($("#printLine").is(":checked")) {
        ifPrintLine = true; // checkbox
    }

    //       
//

//console.log("After overide: switchPerf " + switchPerf + " ifTcorr " + ifTcorr + " ifConvec " + ifConvec + " ifVoigt " + ifVoigt + " ifLinePlot " + ifLinePlot);



    var switchStar = "None";
    var numPreStars = 7;
    //JQuery:
    // None: (default)
    if ($("#none").is(":checked")) {
        switchStar = $("#none").val(); // radio 
    }

// Sun
    if ($("#sun").is(":checked")) {
        switchStar = $("#sun").val(); // radio 
    }
// Vega
    if ($("#vega").is(":checked")) {
        switchStar = $("#vega").val(); // radio 
    }
// Arcturus
    if ($("#arcturus").is(":checked")) {
        switchStar = $("#arcturus").val(); // radio 
    }

// Procyon
    if ($("#procyon").is(":checked")) {
        switchStar = $("#procyon").val(); // radio 
    }

// Regulus
    if ($("#regulus").is(":checked")) {
        switchStar = $("#regulus").val(); // radio 
    }

// 61 Cygni A
    if ($("#61cygnia").is(":checked")) {
        switchStar = $("#61cygnia").val(); // radio 
    }

// 51 Pegasi
    if ($("#51pegasi").is(":checked")) {
        switchStar = $("#51pegasi").val(); // radio 
    }


//JQuery:
    if (switchStar === "Sun") {
        var teff = 5780.0;
        settingsId[0].value = 5780.0;
        //First version is if there's no JQuery-UI round sliders
        //$("#Teff").val(5780.0);
        $("#Teff").roundSlider("setValue", "5780.0");
        var logg = 4.4;
        settingsId[1].value = 4.4;
        //$("#logg").val(4.4);
        $("#logg").roundSlider("setValue", "4.4");
        var logKappaScale = 0.0;
        settingsId[2].value = 0.0;
        //$("#kappaScale").val(0.0);
        $("#kappaScale").roundSlider("setValue", "0.0");
        var massStar = 1.0;
        settingsId[3].value = 1.0;
        //$("#starMass").val(1.0);
        $("#massStar").roundSlider("setValue", "1.0");
    }

    if (switchStar === "Arcturus") {
        var teff = 4250.0;
        settingsId[0].value = 4250.0;
        //$("#Teff").val(4250.0);
        $("#Teff").roundSlider("setValue", "4250.0");
        var logg = 2.0;
        settingsId[1].value = 2.0;
        //$("#logg").val(2.0);
        $("#logg").roundSlider("setValue", "2.0");
        var logKappaScale = -0.5;
        settingsId[2].value = -0.5;
        //$("#kappaScale").val(-0.5);
        $("#kappaScale").roundSlider("setValue", "-0.5");
        var massStar = 1.1;
        settingsId[3].value = 1.1;
        //$("#starMass").val(1.1);
        $("#massStar").roundSlider("setValue", "1.1");
    }

    if (switchStar === "Vega") {
        var teff = 9550.0;
        settingsId[0].value = 9550.0;
        //$("#Teff").val(9550.0);
        $("#Teff").roundSlider("setValue", "9550.0");
        var logg = 3.95;
        settingsId[1].value = 3.95;
        //$("#logg").val(3.95);
        $("#logg").roundSlider("setValue", "3.95");
        var logKappaScale = -0.5;
        settingsId[2].value = -0.5;
        //$("#kappaScale").val(-0.5);
        $("#kappaScale").roundSlider("setValue", "-0.5");
        var massStar = 2.1;
        settingsId[3].value = 2.1;
        //$("#starMass").val(2.1);
        $("#massStar").roundSlider("setValue", "2.1");
    }

    if (switchStar === "Regulus") {
        var teff = 12460.0;
        settingsId[0].value = 12460.0;
        //$("#Teff").val(12460.0);
        $("#Teff").roundSlider("setValue", "12460.0");
        var logg = 3.5;
        settingsId[1].value = 3.5;
        //$("#logg").val(3.54);
        $("#logg").roundSlider("setValue", "3.5");
        var logKappaScale = 0.0;
        settingsId[2].value = 0.0;
        //$("#kappaScale").val(0.0);
        $("#kappaScale").roundSlider("setValue", "0.0");
        var massStar = 3.8;
        settingsId[3].value = 3.8;
        //$("#starMass").val(3.8);
        $("#massStar").roundSlider("setValue", "3.8");
    }

    if (switchStar === "Procyon") {
        var teff = 6530.0;
        settingsId[0].value = 6530.0;
        //$("#Teff").val(6530.0);
        $("#Teff").roundSlider("setValue", "6530.0");
        var logg = 4.0;
        settingsId[1].value = 4.0;
        //$("#logg").val(4.0);
        $("#logg").roundSlider("setValue", "4.0");
        var logKappaScale = 0.0;
        settingsId[2].value = 0.0;
        //$("#kappaScale").val(0.0);
        $("#kappaScale").roundSlider("setValue", "0.0");
        var massStar = 1.4;
        settingsId[3].value = 1.4;
        //$("#starMass").val(1.4);
        $("#massStar").roundSlider("setValue", "1.4");
    }

    if (switchStar === "61CygniA") {
        var teff = 4525.0;
        settingsId[0].value = 4525.0;
        //$("#Teff").val(4526.0);
        $("#Teff").roundSlider("setValue", "4525.0");
        var logg = 4.2;
        settingsId[1].value = 4.2;
        //$("#logg").val(4.2);
        $("#logg").roundSlider("setValue", "4.2");
        var logKappaScale = 0.0;
        settingsId[2].value = 0.0;
        //$("#kappaScale").val(0.0);
        $("#kappaScale").roundSlider("setValue", "0.0");
        var massStar = 0.6;
        settingsId[3].value = 0.6;
        //$("#starMass").val(0.63);
        $("#massStar").roundSlider("setValue", "0.6");
    }

    if (switchStar === "51Pegasi") {
        var teff = 5570.0;
        settingsId[0].value = 5570.0;
        //$("#Teff").val(5570.0);
        $("#Teff").roundSlider("setValue", "5570.0");
        var logg = 4.3;
        settingsId[1].value = 4.3;
        //$("#logg").val(4.33);
        $("#logg").roundSlider("setValue", "4.3");
        var logKappaScale = 0.0;
        settingsId[2].value = 0.0;
        //$("#kappaScale").val(0.0);
        $("#kappaScale").roundSlider("setValue", "0.0");
        var massStar = 1.1;
        settingsId[3].value = 1.1;
        //$("#starMass").val(1.11);
        $("#massStar").roundSlider("setValue", "1.1");
    }

    var switchPlanet = "None";
    var numPrePlanets = 1;
    //JQuery:
    // None: (default)
    if ($("#noneplanet").is(":checked")) {
        switchPlanet = $("#noneplanet").val(); // radio 
    }

// Earth
    if ($("#earth").is(":checked")) {
        switchPlanet = $("#earth").val(); // radio 
    }

    if (switchPlanet === "Earth") {
        var GHTemp = 20.0;
        settingsId[4].value = 20.0;
        //$("#GHTemp").val(20.0);
        $("#GHTemp").roundSlider("setValue", "20.0");
        var Albedo = 0.3;
        settingsId[5].value = 0.3;
        //$("#Albedo").val(0.3);
        $("#Albedo").roundSlider("setValue", "0.3");
    }


    var switchLine = "None";
    var numPreLines = 10;
    //var numPreLines = 0;


    // None: (default)
//    if (settingsId[17].checked) {
//        switchLine = settingsId[17].value; // radio 
//    }
    //JQuery:
    if ($("#noneline").is(":checked")) {
        switchLine = $("#noneline").val(); // radio 
    }
// NaI D_1
    if ($("#NaID1").is(":checked")) {
        switchLine = $("#NaID1").val(); // radio        
    }
// NaI D_2
    if ($("#NaID2").is(":checked")) {
        switchLine = $("#NaID2").val(); // radio 
    }
// MgI b_1
    if ($("#MgIb1").is(":checked")) {
        switchLine = $("#MgIb1").val(); // radio 
    }
// CaII K
    if ($("#CaIIK").is(":checked")) {
        switchLine = $("#CaIIK").val(); // radio        
    }
// CaII H
    if ($("#CaIIH").is(":checked")) {
        switchLine = $("#CaIIH").val(); // radio        
    }
// CaI 4227
    if ($("#CaI4227").is(":checked")) {
        switchLine = $("#CaI4227").val(); // radio        
    }
// FeI 4271 
    if ($("#FeI4271").is(":checked")) {
        switchLine = $("#FeI4271").val(); // radio        
    }
// FeI 4045 
    if ($("#FeI4045").is(":checked")) {
        switchLine = $("#FeI4045").val(); // radio        
    }
// HeI 4471
    if ($("#HeI4471").is(":checked")) {
        switchLine = $("#HeI4471").val(); // radio        
    }
// HeI 4387
    if ($("#HeI4387").is(":checked")) {
        switchLine = $("#HeI4387").val(); // radio        
    }

//JQuery:
    if (switchLine === "NaID1") {
        var lam0 = 589.592;
        settingsId[6].value = 589.592;
        $("#lambda_0").val(589.592);
        var A12 = 6.3; // Grevesse & Sauval 98
        settingsId[7].value = 6.3;
        $("#A12").val(6.3);
        var logF = -0.495;
        settingsId[8].value = -0.495;
        $("#logf").val(-0.495);
        var chiI1 = 5.139;
        settingsId[9].value = 5.139;
        $("#chi_I1").val(5.139);
        var chiI2 = 47.286;
        settingsId[10].value = 47.286;
        $("#chi_I2").val(47.286);
        var chiL = 0.0;
        settingsId[11].value = 0.0;
        $("#chi_L").val(0.0);
        var gw1 = 2.0;
        settingsId[12].value = 2.0;
        $("#gw_1").val(2.0);
        var gw2 = 1.0;
        //ettingsId[13].value = 1.0;
        $("#gw_2").val(1.0);
        var gwL = 2.0;
        settingsId[14].value = 2.0;
        $("#gw_L").val(2.0);
        var mass = 22.990;
        settingsId[16].value = 22.990;
        $("#mass").val(22.990);
        var logGammaCol = 1.0;
        settingsId[17].value = 1.0;
        $("#gammaCol").val(1.0);
    }

    if (switchLine === "NaID2") {
        var lam0 = 588.995;
        settingsId[6].value = 588.995;
        $("#lambda_0").val(588.995);
        var A12 = 6.3; // Grevesse & Sauval 98
        settingsId[7].value = 6.3;
        $("#A12").val(6.3);
        var logF = -0.193;
        settingsId[8].value = -0.193;
        $("#logf").val(-0.193);
        var chiI1 = 5.139;
        settingsId[9].value = 5.139;
        $("#chi_I1").val(5.139);
        var chiI2 = 47.286;
        settingsId[10].value = 47.286;
        $("#chi_I2").val(47.286);
        var chiL = 0.0;
        settingsId[11].value = 0.0;
        $("#chi_L").val(0.0);
        var gw1 = 2.0;
        settingsId[12].value = 2.0;
        $("#gw_1").val(2.0);
        var gw2 = 1.0;
        settingsId[13].value = 1.0;
        $("#gw_2").val(1.0);
        var gwL = 2.0;
        settingsId[14].value = 2.0;
        $("#gw_L").val(2.0);
        var mass = 22.990;
        settingsId[16].value = 22.990;
        $("#mass").val(22.990);
        var logGammaCol = 1.0;
        settingsId[17].value = 1.0;
        $("#gammaCol").val(1.0);
    }

    if (switchLine === "MgIb1") {
        var lam0 = 518.360;
        settingsId[6].value = 518.360;
        $("#lambda_0").val(518.360);
        var A12 = 7.6; // Grevesse & Sauval 98
        settingsId[7].value = 7.6;
        $("#A12").val(7.6);
        var logF = -0.867;
        settingsId[8].value = -0.867;
        $("#logf").val(-0.867);
        var chiI1 = 7.646;
        settingsId[9].value = 7.646;
        $("#chi_I1").val(7.646);
        var chiI2 = 15.035;
        settingsId[10].value = 15.035;
        $("#chi_I2").val(15.035);
        var chiL = 2.717;
        settingsId[11].value = 2.717;
        $("#chi_L").val(2.717);
        var gw1 = 1.0;
        settingsId[12].value = 1.0;
        $("#gw_1").val(1.0);
        var gw2 = 1.0;
        settingsId[13].value = 1.0;
        $("#gw_2").val(1.0);
        var gwL = 5.0;
        settingsId[14].value = 5.0;
        $("#gw_L").val(5.0);
        var mass = 24.305;
        settingsId[16].value = 24.305;
        $("#mass").val(24.305);
        var logGammaCol = 1.0;
        settingsId[17].value = 1.0;
        $("#gammaCol").val(1.0);
    }

    if (switchLine === "CaIIK") {
        var lam0 = 393.366;
        settingsId[6].value = 393.366;
        $("#lambda_0").val(393.366);
        var A12 = 6.34; // Grevesse & Sauval 98
        settingsId[7].value = 6.34;
        $("#A12").val(6.34);
        var logF = -0.166;
        settingsId[8].value = -0.166;
        $("#logf").val(-0.166);
        var chiI1 = 6.113;
        settingsId[9].value = 6.113;
        $("#chi_I1").val(6.113);
        var chiI2 = 11.872;
        settingsId[10].value = 11.872;
        $("#chi_I2").val(11.872);
        //This is necessary for consistency with Stage II treatment of user-defined spectral line:
        var chiL = 0.01 + chiI1;
        settingsId[11].value = 0.01 + chiI1;
        $("#chi_L").val(0.01 + chiI1);
        var gw1 = 1.0;
        settingsId[12].value = 1.0;
        $("#gw_1").val(1.0);
        var gw2 = 2.0;
        settingsId[13].value = 2.0;
        $("#gw_2").val(2.0);
        var gwL = 2.0;
        settingsId[14].value = 2.0;
        $("#gw_L").val(2.0);
        var mass = 40.078;
        settingsId[16].value = 40.078;
        $("#mass").val(40.078);
        var logGammaCol = 0.5;
        settingsId[17].value = 0.5;
        $("#gammaCol").val(0.5);
    }

    if (switchLine === "CaIIH") {
        var lam0 = 396.847;
        settingsId[6].value = 396.847;
        $("#lambda_0").val(396.847);
        var A12 = 6.34; // Grevesse & Sauval 98
        settingsId[7].value = 6.34;
        $("#A12").val(6.34);
        var logF = -0.482;
        settingsId[8].value = -0.482;
        $("#logf").val(-0.482);
        var chiI1 = 6.113;
        settingsId[9].value = 6.113;
        $("#chi_I1").val(6.113);
        var chiI2 = 11.872;
        settingsId[10].value = 11.872;
        $("#chi_I2").val(11.872);
        //This is necessary for consistency with Stage II treatment of user-defined spectral line:
        var chiL = 0.01 + chiI1;
        settingsId[11].value = 0.01 + chiI1;
        $("#chi_L").val(0.01 + chiI1);
        var gw1 = 1.0;
        settingsId[12].value = 1.0;
        $("#gw_1").val(1.0);
        var gw2 = 2.0;
        settingsId[13].value = 2.0;
        $("#gw_2").val(2.0);
        var gwL = 2.0;
        settingsId[14].value = 2.0;
        $("#gw_L").val(2.0);
        var mass = 40.078;
        settingsId[16].value = 40.078;
        $("#mass").val(40.078);
        var logGammaCol = 0.5;
        settingsId[17].value = 0.5;
        $("#gammaCol").val(0.5);
    }

    if (switchLine === "CaI4227") {
        var lam0 = 422.673;
        settingsId[6].value = 422.673;
        $("#lambda_0").val(422.673);
        var A12 = 6.34; // Grevesse & Sauval 98
        settingsId[7].value = 6.34;
        $("#A12").val(6.34);
        var logF = 0.243;
        settingsId[8].value = 0.243;
        $("#logf").val(0.243);
        var chiI1 = 6.113;
        settingsId[9].value = 6.113;
        $("#chi_I1").val(6.113);
        var chiI2 = 11.872;
        settingsId[10].value = 11.872;
        $("#chi_I2").val(11.872);
        var chiL = 0.0;
        settingsId[11].value = 0.0;
        $("#chi_L").val(0.0);
        var gw1 = 1.0;
        settingsId[12].value = 1.0;
        $("#gw_1").val(1.0);
        var gw2 = 1.0;
        settingsId[13].value = 1.0;
        $("#gw_2").val(1.0);
        var gwL = 1.0;
        settingsId[14].value = 1.0;
        $("#gw_L").val(1.0);
        var mass = 40.078;
        settingsId[16].value = 40.078;
        $("#mass").val(40.078);
        var logGammaCol = 1.0;
        settingsId[17].value = 1.0;
        $("#gammaCol").val(1.0);
    }

    if (switchLine === "FeI4045") {
        var lam0 = 404.581;
        settingsId[6].value = 404.581;
        $("#lambda_0").val(404.581);
        var A12 = 7.50; // Grevesse & Sauval 98
        settingsId[7].value = 7.50;
        $("#A12").val(7.50);
        var logF = -0.674;
        settingsId[8].value = -0.674;
        $("#logf").val(-0.674);
        var chiI1 = 7.902;
        settingsId[9].value = 7.902;
        $("#chi_I1").val(7.902);
        var chiI2 = 16.199;
        settingsId[10].value = 16.199;
        $("#chi_I2").val(16.199);
        var chiL = 1.485;
        settingsId[11].value = 1.485;
        $("#chi_L").val(1.485);
        var gw1 = 1.0;
        settingsId[12].value = 1.0;
        $("#gw_1").val(1.0);
        var gw2 = 1.0;
        settingsId[13].value = 1.0;
        $("#gw_2").val(1.0);
        var gwL = 9.0;
        settingsId[14].value = 9.0;
        $("#gw_L").val(9.0);
        var mass = 55.845;
        settingsId[16].value = 55.845;
        $("#mass").val(55.845);
        var logGammaCol = 0.0;
        settingsId[17].value = 0.0;
        $("#gammaCol").val(0.0);
    }

    if (switchLine === "FeI4271") {
        var lam0 = 427.176;
        settingsId[6].value = 427.176;
        $("#lambda_0").val(427.176);
        var A12 = 7.50; // Grevesse & Sauval 98
        settingsId[7].value = 7.50;
        $("#A12").val(7.50);
        var logF = -1.118;
        settingsId[8].value = -1.118;
        $("#logf").val(-1.118);
        var chiI1 = 7.902;
        settingsId[9].value = 7.902;
        $("#chi_I1").val(7.902);
        var chiI2 = 16.199;
        settingsId[10].value = 16.199;
        $("#chi_I2").val(16.199);
        var chiL = 1.485;
        settingsId[11].value = 1.485;
        $("#chi_L").val(1.485);
        var gw1 = 1.0;
        //ettingsId[12].value = 1.0;
        $("#gw_1").val(1.0);
        var gw2 = 1.0;
        settingsId[13].value = 1.0;
        $("#gw_2").val(1.0);
        var gwL = 9.0;
        settingsId[14].value = 9.0;
        $("#gw_L").val(9.0);
        var mass = 55.845;
        settingsId[16].value = 55.845;
        $("#mass").val(55.845);
        var logGammaCol = 0.0;
        settingsId[17].value = 0.0;
        $("#gammaCol").val(0.0);
    }

    if (switchLine === "HeI4387") {
        var lam0 = 438.793;
        settingsId[6].value = 438.793;
        $("#lambda_0").val(438.793);
        var A12 = 10.93; // Grevesse & Sauval 98
        settingsId[7].value = 10.93;
        $("#A12").val(10.93);
        var logF = -1.364;
        settingsId[8].value = -1.364;
        $("#logf").val(-1.364);
        var chiI1 = 24.587;
        settingsId[9].value = 24.587;
        $("#chi_I1").val(24.587);
        var chiI2 = 54.418;
        settingsId[10].value = 54.418;
        $("#chi_I2").val(54.418);
        var chiL = 21.218;
        settingsId[11].value = 21.218;
        $("#chi_L").val(21.218);
        var gw1 = 1.0;
        settingsId[12].value = 1.0;
        $("#gw_1").val(1.0);
        var gw2 = 1.0;
        settingsId[13].value = 1.0;
        $("#gw_2").val(1.0);
        var gwL = 3.0;
        settingsId[14].value = 3.0;
        $("#gw_L").val(3.0);
        var mass = 4.003;
        settingsId[16].value = 4.003;
        $("#mass").val(4.003);
        var logGammaCol = 0.0;
        settingsId[17].value = 0.0;
        $("#gammaCol").val(0.0);
    }

    if (switchLine === "HeI4471") {
        var lam0 = 447.147;
        settingsId[6].value = 447.147;
        $("#lambda_0").val(447.147);
        var A12 = 10.93; // Grevesse & Sauval 98
        settingsId[7].value = 10.93;
        $("#A12").val(10.93);
        var logF = -0.986;
        settingsId[8].value = -0.986;
        $("#logf").val(-0.986);
        var chiI1 = 24.587;
        settingsId[9].value = 24.587;
        $("#chi_I1").val(24.587);
        var chiI2 = 54.418;
        settingsId[10].value = 54.418;
        $("#chi_I2").val(54.418);
        var chiL = 20.964;
        settingsId[11].value = 20.964;
        $("#chi_L").val(20.964);
        var gw1 = 1.0;
        settingsId[12].value = 1.0;
        $("#gw_1").val(1.0);
        var gw2 = 1.0;
        settingsId[13].value = 1.0;
        $("#gw_2").val(1.0);
        var gwL = 5.0;
        settingsId[14].value = 5.0;
        $("#gw_L").val(5.0);
        var mass = 4.003;
        settingsId[16].value = 4.003;
        $("#mass").val(4.003);
        var logGammaCol = 0.0;
        settingsId[17].value = 0.0;
        $("#gammaCol").val(0.0);
    }



    //
    // Form validation and Initial sanity checks:
    // 

// Stellar parameters:
//
    var flagArr = [];
    flagArr.length = numInputs;
    flagArr[0] = false;
    var minTeff = 2000.0;
    var maxTeff = 40000.0;
    if (teff === null || teff == "") {
        alert("Teff must be filled out");
        return;
    }
    if (teff < minTeff) {
        flagArr[0] = true;
        teff = minTeff;
        var teffStr = String(minTeff);
        settingsId[0].value = minTeff;
        //first version is if there's no JQuery-UI
        //$("#Teff").val(minTeff);
        $("#Teff").roundSlider("setValue", minTeff);
    }
    if (teff > maxTeff) {
        flagArr[0] = true;
        teff = maxTeff;
        var teffStr = String(maxTeff);
        settingsId[0].value = maxTeff;
        //$("#Teff").val(maxTeff);
        $("#Teff").roundSlider("setValue", maxTeff);
    }
//logg limit is strongly Teff-dependent:
    if (logg === null || logg == "") {
        alert("log(g) must be filled out");
        return;
    }
    var minLogg = 3.5; //safe initialization
    var minLoggStr = "3.5";
    if (teff <= 4000.0) {
        minLogg = 0.5;
        minLoggStr = "0.5";
    } else if ((teff > 4000.0) && (teff <= 5000.0)) {
        minLogg = 1.5;
        minLoggStr = "1.5";
    } else if ((teff > 5000.0) && (teff <= 6000.0)) {
        minLogg = 2.0;
        minLoggStr = "2.0";
    } else if ((teff > 6000.0) && (teff <= 7000.0)) {
        minLogg = 2.5;
        minLoggStr = "2.5";
    } else if ((teff > 7000.0) && (teff < 9000.0)) {
        minLogg = 3.0;
        minLoggStr = "3.0";
    } else if (teff >= 9000.0) {
        minLogg = 3.5;
        minLoggStr = "3.5";
    }
    flagArr[1] = false;
    if (logg < minLogg) {
        flagArr[1] = true;
        logg = minLogg;
        var loggStr = minLoggStr;
        settingsId[1].value = minLogg;
        //$("#logg").val(minLogg);
        $("#logg").roundSlider("setValue", minLogg);
    }
    if (logg > 6.0) {
        flagArr[1] = true;
        logg = 6.0;
        var loggStr = "6.0";
        settingsId[1].value = 6.0;
        //$("#logg").val(5.5);
        $("#logg").roundSlider("setValue", 6.0);
    }
    if (logKappaScale === null || logKappaScale === "") {
        alert("logKappaScale must be filled out");
        return;
    }
    flagArr[2] = false;
    if (logKappaScale < -3.0) {
        flagArr[2] = true;
        logKappaScale = -3.0;
        var logKappaStr = "-3.0";
        settingsId[2].value = -3.0;
        //$("#kappaScale").val(-2.0);
        $("#kappaScale").roundSlider("setValue", -3.0);
    }
    if (logKappaScale > 1.0) {
        flagArr[2] = true;
        logKappaScale = 1.0;
        var kappaStr = "1.0";
        settingsId[2].value = 1.0;
        //$("#kappaScale").val(0.5);
        $("#kappaScale").roundSlider("setValue", 1.0);
    }
    if (mass === null || mass == "") {
        alert("mass must be filled out");
        return;
    }
    flagArr[3] = false;
    if (massStar < 0.1) {
        flagArr[3] = true;
        massStar = 0.1;
        var massStarStr = "0.1";
        settingsId[3].value = 0.1;
        //$("#starMass").val(0.1);
        $("#starMass").roundSlider("setValue", 0.1);
    }
    if (massStar > 10.0) {
        flagArr[3] = true;
        massStar = 10.0;
        var massStarStr = "10.0";
        settingsId[3].value = 10.0;
        //$("#starMass").val(8.0);
        $("#starMass").roundSlider("setValue", 10.0);
    }

    var grav = Math.pow(10.0, logg);
    var kappaScale = Math.pow(10.0, logKappaScale);
    //

    // Planetary parameters for habitable zone calculation:
    //
    if (greenHouse === null || greenHouse === "") {
        alert("greenHouse must be filled out");
        return;
    }
    flagArr[4] = false;
    if (greenHouse < 0.0) {
        flagArr[4] = true;
        greenHouse = 0.0;
        var greenHouseStr = "0.0";
        settingsId[4].value = 0.0;
        //$("#GHTemp").val(0.0);
        $("#GHTemp").roundSlider("setValue", 0.0);
    }
    if (greenHouse > 200.0) {
        flagArr[4] = true;
        greenHouse = 200.0;
        var greenHouseStr = "200.0";
        settingsId[4].value = 200.0;
        //$("#GHTemp").val(200.0);
        $("#GHTemp").roundSlider("setValue", 200.0);
    }
    if (albedo === null || albedo === "") {
        alert("albedo must be filled out");
        return;
    }
    flagArr[5] = false;
    if (albedo < 0.0) {
        flagArr[5] = true;
        albedo = 0.0;
        var albedoStr = "0.0";
        settingsId[5].value = 0.0;
        //$("#Albedo").val(0.0);
        $("#Albedo").roundSlider("setValue", 0.0);
    }
    if (albedo > 1.0) {
        flagArr[5] = true;
        greenHouse = 1.0;
        var albedoStr = "1.0";
        settingsId[5].value = 1.0;
        //$("#Albedo").val(1.0);
        $("#Albedo").roundSlider("setValue", 1.0);
    }


// Representative spectral line and associated atomic parameters
//
    if (lam0 === null || lam0 == "") {
        alert("lam0 must be filled out");
        return;
    }
    flagArr[6] = false;
    if (lam0 < 200.0) {
        flagArr[6] = true;
        lam0 = 200.0;
        var lamStr = "200";
        settingsId[6].value = 200.0;
        $("#lambda_0").val(200.0);
    }
    if (lam0 > 10000.0) {
        flagArr[6] = true;
        lam0 = 10000.0;
        var lamStr = "10000";
        settingsId[6].value = 10000.0;
        $("#lambda_0").val(10000.0);
    }
    if (A12 === null || A12 == "") {
        alert("A12 must be filled out");
        return;
    }
    flagArr[7] = false;
    if (A12 < 2.0) {
        flagArr[7] = true;
        A12 = 2.0;
        var nStr = "2.0";
        settingsId[7].value = 2.0;
        $("#A12").val(2.0);
    }
    //Upper limit set high to accomodate Helium!:
    if (A12 > 11.0) {
        flagArr[7] = true;
        A12 = 11.0;
        var nStr = "11.0";
        settingsId[7].value = 11.0;
        $("#A12").val(11.0);
    }
    if (logF === null || logF === "") {
        alert("logF must be filled out");
        return;
    }
    flagArr[8] = false;
    if (logF < -6.0) {
        flagArr[8] = true;
        logF = -6.0;
        var fStr = "-6.0";
        settingsId[8].value = -6.0;
        $("#logf").val(-6.0);
    }
    if (logF > 1.0) {
        flagArr[8] = true;
        logF = 1.0;
        var fStr = "1.0";
        settingsId[8].value = 1.0;
        $("#logf").val(1.0);
    }
    if (chiI1 === null || chiI1 == "") {
        alert("chiI1 must be filled out");
        return;
    }
    if (chiI2 === null || chiI2 == "") {
        alert("chiI2 must be filled out");
        return;
    }
    if (chiL === null || chiL === "") {
        alert("chiL must be filled out");
        return;
    }
    flagArr[9] = false;
    if (chiI1 < 5.0) {
        flagArr[9] = true;
        chiI1 = 5.0;
        var ionStr = "5.0";
        settingsId[9].value = 5.0;
        $("#chi_I1").val(5.0);
    }
    if (chiI1 > 25.0) {
        flagArr[9] = true;
        chiI1 = 25.0;
        var ionStr = "25.0";
        settingsId[9].value = 25.0;
        $("#chi_I1").val(25.0);
    }

    flagArr[10] = false;
    if (chiI2 < 5.0) {
        flagArr[10] = true;
        chiI2 = 5.0;
        var ionStr = "5.0";
        settingsId[10].value = 5.0;
        $("#chi_I2").val(5.0);
    }
    if (chiI2 > 55.0) {
        flagArr[10] = true;
        chiI2 = 55.0;
        var ionStr = "55.0";
        settingsId[10].value = 55.0;
        $("#chi_I2").val(55.0);
    }

    var ionized = false;
    // Note: Upper limit of chiL depends on value of chiI1 above!
    flagArr[11] = false;
    if (chiL < 0.0) {
        flagArr[11] = true;
        chiL = 0.0; // Ground state case!
        var excStr = "0.0";
        settingsId[11].value = 0.0;
        $("#chi_L").val(0.0);
    }
// choice of neutral or singly ionized stage
    if (chiL < chiI1) {
        var ionized = false;
    }
    if (chiL === chiI1) {

        flagArr[11] = true;
        ionized = false;
        chiL = 0.9 * chiI1;
        var excStr = ionStr;
        settingsId[11].value = chiL;
        $("#chi_L").val(chiL);
    }
    if (chiL > chiI1) {
        ionized = true;
        // chiL = chiL - chiI1;  // No!  Not here!
        if (chiL > chiI1 + 5.0) {
            flagArr[11] = true;
            chiL = chiI1 + 5.0;
            var excStr = " " + chiL;
            settingsId[11].value = chiL;
            $("#chi_L").val(chiL);
        }
    }
    if (gw1 === null || gw1 == "") {
        alert("gw1 must be filled out");
        return;
    }
    if (gw2 === null || gw2 == "") {
        alert("gw2 must be filled out");
        return;
    }
    if (gwL === null || gwL == "") {
        alert("gwL must be filled out");
        return;
    }
    flagArr[12] = false;
    if (gw1 < 1.0) {
        flagArr[12] = true;
        gw1 = 1.0;
        var ionStr = "1";
        settingsId[12].value = 1.0;
        $("#gw_1").val(1.0);
    }
    if (gw1 > 100.0) {
        flagArr[12] = true;
        gw1 = 100.0;
        var ionStr = "100";
        settingsId[12].value = 100.0;
        $("#gw_1").val(100.0);
    }

    flagArr[13] = false;
    if (gw2 < 1.0) {
        flagArr[13] = true;
        gw2 = 1.0;
        var ionStr = "1";
        settingsId[13].value = 1.0;
        $("#gw_2").val(1.0);
    }
    if (gw2 > 100.0) {
        flagArr[13] = true;
        gw2 = 100.0;
        var ionStr = "100";
        settingsId[13].value = 100.0;
        $("#gw_2").val(100.0);
    }

    flagArr[14] = false;
    if (gwL < 1.0) {
        flagArr[14] = true;
        gwL = 1.0;
        var ionStr = "1";
        settingsId[14].value = 1.0;
        $("#gw_L").val(1.0);
    }
    if (gwL > 100.0) {
        flagArr[14] = true;
        gwL = 100.0;
        var ionStr = "100";
        settingsId[14].value = 100.0;
        $("#gw_L").val(100.0);
    }
    if (xiT === null || xiT == "") {
        alert("xiT must be filled out");
        return;
    }
    flagArr[15] = false;
    if (xiT < 0.0) {
        flagArr[15] = true;
        xiT = 0.0;
        var xitStr = "0.0";
        settingsId[15].value = 0.0;
        $("#xi_T").val(0.0);
    }
    if (xiT > 4.0) {
        flagArr[15] = true;
        xiT = 4.0;
        var xitStr = "4.0";
        settingsId[15].value = 4.0;
        $("#xi_T").val(4.0);
    }
    if (mass === null || mass == "") {
        alert("mass must be filled out");
        return;
    }
    flagArr[16] = false;
    if (mass < 1.0) {
        flagArr[16] = true;
        mass = 1.0;
        var massStr = "1.0";
        settingsId[16].value = 1.0;
        $("#mass").val(1.0);
    }
    if (mass > 60.0) {
        flagArr[16] = true;
        mass = 60.0;
        var massStr = "60";
        settingsId[16].value = 60.0;
        $("#mass").val(60.0);
    }
    if (logGammaCol === null || logGammaCol === "") {
        alert("logGammaCol must be filled out");
        return;
    }
    flagArr[17] = false;
    if (logGammaCol < 0.0) {
        flagArr[17] = true;
        logGammaCol = 0.0;
        var gamStr = "0.0";
        settingsId[17].value = 0.0;
        $("#gammaCol").val(0.0);
    }
    if (logGammaCol > 1.0) {
        flagArr[17] = true;
        logGammaCol = 1.0;
        var gamStr = "1.0";
        settingsId[17].value = 1.0;
        $("#gammaCol").val(1.0);
    }



//var ionized = false; // DEBUG


// This has to be up here for some reason:
// Get the ID of the container div:



    var textId = document.getElementById("outPanel"); // text output area

    //var masterId = document.getElementById("container"); // graphical output area
    var plotOneId = document.getElementById("plotOne");
    var plotTwoId = document.getElementById("plotTwo");
    var plotThreeId = document.getElementById("plotThree");
    var plotFourId = document.getElementById("plotFour");
    var plotFiveId = document.getElementById("plotFive");
    var plotSixId = document.getElementById("plotSix");
    var plotSevenId = document.getElementById("plotSeven");
    var plotEightId = document.getElementById("plotEight");
    var plotNineId = document.getElementById("plotNine");
    var plotTenId = document.getElementById("plotTen");
    var plotElevenId = document.getElementById("plotEleven");
    var plotTwelveId = document.getElementById("plotTwelve");
    var printModelId = document.getElementById("printModel"); //detailed model print-out area

    if (ifShowAtmos === true) {
        plotOneId.style.display = "block";
        plotTwoId.style.display = "block";
        plotThreeId.style.display = "block";
    }
    if (ifShowRad === true) {
        plotFourId.style.display = "block";
        plotFiveId.style.display = "block";
    }
    if (ifShowLine === true) {
        plotSixId.style.display = "block";
        plotEightId.style.display = "block";
    }
    if (ifShowAtmos === false) {
        plotOneId.style.display = "none";
        plotTwoId.style.display = "none";
        plotThreeId.style.display = "none";
    }
    if (ifShowRad === false) {
        plotFourId.style.display = "none";
        plotFiveId.style.display = "none";
    }
    if (ifShowLine === false) {
        plotSixId.style.display = "none";
        plotEightId.style.display = "none";
    }
    if ((ifPrintAtmos === true) ||
            (ifPrintSED === true) ||
            (ifPrintLDC === true) ||
            (ifPrintLine === true)) {
        printModelId.style.display = "block";
    } else if (ifPrintNone === true) {
        printModelId.style.display = "none";
    }
    //printModelId.style.display = "block"; //for testing

    // Begin compute code:


    //Gray structure and Voigt line code code begins here:
    // Initial set-up:

    // optical depth grid
    var numDeps = 48;
    var log10MinDepth = -6.0;
    var log10MaxDepth = 2.0;
    //var numThetas = 10; // Guess

    var numLams = 250;
    //var numLams = 100;
    var lamUV = 200.0;
    var lamIR = 1000.0;
    var lamSetup = [lamUV * 1.0e-7, lamIR * 1.0e-7, numLams]; //Start, end wavelength (nm), number of lambdas
    lam0 = lam0 * 1.0e-7; // line centre lambda from nm to cm
    if (diskLambda === null || diskLambda == "") {
        alert("disk wavelength must be filled out");
        return;
    }
    flagArr[18] = false;
    if (diskLambda < lamUV) {
        flagArr[18] = true;
        diskLambda = lamUV;
        var diskLambdaStr = lamUV.toString(10);
        settingsId[18].value = lamUV;
        $("#dskLam").val(lamUV);
    }
    if (diskLambda > lamIR) {
        flagArr[18] = true;
        diskLambda = lamIR;
        var diskLambdaStr = lamIR.toString(10);
        settingsId[18].value = lamIR;
        $("#dskLam").val(lamIR);
    }

    // Solar parameters:
    var teffSun = 5778.0;
    var loggSun = 4.44;
    var gravSun = Math.pow(10.0, loggSun);
    var logKappaScaleSun = 0.0;
    var kappaScaleSun = Math.exp(logKappaScaleSun);
    //Solar units:
    var massSun = 1.0;
    var radiusSun = 1.0;
    var logRadius = 0.5 * (Math.log(massStar) + Math.log(gravSun) - Math.log(grav));
    var radius = Math.exp(logRadius);
    //var radius = Math.sqrt(massStar * gravSun / grav); // solar radii
    var logLum = 2.0 * Math.log(radius) + 4.0 * Math.log(teff / teffSun);
    var bolLum = Math.exp(logLum); // L_Bol in solar luminosities 

    //Composition by mass fraction - needed for opacity approximations
    //   and interior structure
    var massX = 0.70; //Hydrogen
    var massY = 0.28; //Helium
    var massZSun = 0.02; // "metals"
    var massZ = massZSun * kappaScale; //approximation

    var logNH = 17.0;
    var logN = (A12 - 12.0) + logNH;
    var logE = logTen(Math.E); // for debug output

    //Vega parameters (of Phoenix model- Teff not quite right!)
    var teffVega = 9950.0;
    var loggVega = 3.95;
    var gravVega = Math.pow(10.0, loggVega);
    var kappaScaleVega = 0.333;

// Is this the first computation *at all* in the current Web session??
// We only need to compute the Sun's structure once - ever
    //var isSunFirst = true; //initialization

    //Store basic stellar parameters that control atmospheric structure:


    //log_10 Rosseland optical depth scale  
    //Java: double tauRos[][] = TauScale.tauScale(numDeps);
    //var logTauRos = TauScale(numDeps);
    var tauRos = tauScale(numDeps, log10MinDepth, log10MaxDepth);
    //for (var iD = 0; iD < numDeps; iD++) {
    //    console.log(" iD " + iD + " tauRos[0][iD] " + tauRos[0][iD]);
    //}

    //Now do the same for the Sun, for reference:

// initializations:
    var mmwSun = [];
    mmwSun.length = numDeps;
    var tempSun = [];
    tempSun.length = 2;
    tempSun[0] = [];
    tempSun[1] = [];
    tempSun[0].length = numDeps;
    tempSun[1].length = numDeps;
    var kappaSun = [];
    kappaSun.length = 2;
    kappaSun[0] = [];
    kappaSun[1] = [];
    kappaSun[0].length = numDeps;
    kappaSun[1].length = numDeps;
    var pressSun = [];
    pressSun.length = 4;
    pressSun[0] = [];
    pressSun[1] = [];
    pressSun[2] = [];
    pressSun[3] = [];
    pressSun[0].length = numDeps;
    pressSun[1].length = numDeps;
    pressSun[2].length = numDeps;
    pressSun[3].length = numDeps;
    var rhoSun = [];
    rhoSun.length = 2;
    rhoSun[0] = [];
    rhoSun[1] = [];
    rhoSun[0].length = numDeps;
    rhoSun[1].length = numDeps;
    var NeSun = [];
    NeSun.length = 2;
    NeSun[0] = [];
    NeSun[1] = [];
    NeSun[0].length = numDeps;
    NeSun[1].length = numDeps;
    //
    var mmwVega = [];
    mmwVega.length = numDeps;
    var tempVega = [];
    tempVega.length = 2;
    tempVega[0] = [];
    tempVega[1] = [];
    tempVega[0].length = numDeps;
    tempVega[1].length = numDeps;
    var kappaVega = [];
    kappaVega.length = 2;
    kappaVega[0] = [];
    kappaVega[1] = [];
    kappaVega[0].length = numDeps;
    kappaVega[1].length = numDeps;
    //var pGasVega = [];
    //pGasVega.length = 2;
    // pGasVega[0] = [];
    // pGasVega[1] = [];
    // pGasVega[0].length = numDeps;
    // pGasVega[1].length = numDeps;
    var pressVega = [];
    pressVega.length = 4;
    pressVega[0] = [];
    pressVega[1] = [];
    pressVega[2] = [];
    pressVega[3] = [];
    pressVega[0].length = numDeps;
    pressVega[1].length = numDeps;
    pressVega[2].length = numDeps;
    pressVega[3].length = numDeps;
    var rhoVega = [];
    rhoVega.length = 2;
    rhoVega[0] = [];
    rhoVega[1] = [];
    rhoVega[0].length = numDeps;
    rhoVega[1].length = numDeps;
    var NeVega = [];
    NeVega.length = 2;
    NeVega[0] = [];
    NeVega[1] = [];
    NeVega[0].length = numDeps;
    NeVega[1].length = numDeps;

    /*
     var rhoDfg2 = [];
     rhoDfg2.length = 2;
     rhoDfg2[0] = [];
     rhoDfg2[1] = [];
     rhoDfg2[0].length = numDeps;
     rhoDfg2[1].length = numDeps;
     var NeDfg2 = [];
     NeDfg2.length = 2;
     NeDfg2[0] = [];
     NeDfg2[1] = [];
     NeDfg2[0].length = numDeps;
     NeDfg2[1].length = numDeps;
     */
    if (ifLineOnly === true) {

        var teff = Number(sessionStorage.getItem("teff"));
        settingsId[0].value = Number(sessionStorage.getItem("teff"));
        $("#Teff").val(Number(sessionStorage.getItem("teff")));
        var logg = Number(sessionStorage.getItem("logg"));
        settingsId[1].value = Number(sessionStorage.getItem("logg"));
        $("#logg").val(Number(sessionStorage.getItem("logg")));
        var kappaScale = Number(sessionStorage.getItem("kappaScale"));
        settingsId[2].value = Number(sessionStorage.getItem("kappaScale"));
        $("#kappaScale").val(Number(sessionStorage.getItem("kappaScale")));
        var massStar = Number(sessionStorage.getItem("starMass"));
        settingsId[3].value = Number(sessionStorage.getItem("starMass"));
        $("#starMass").val(Number(sessionStorage.getItem("starMass")));
        //console.log("ifLineOnly mode - solar structure, ifLineOnly: " + ifLineOnly);

        //We've already stored the solar structure - just retrieve logarithmic quantities
        // and reconstruct linear quantities

        for (var i = 0; i < numDeps; i++) {
            //console.log(keyTemp[i]);
            storeName = "tempSun" + String(i);
            tempSun[1][i] = Number(sessionStorage.getItem(storeName));
            tempSun[0][i] = Math.exp(tempSun[1][i]);
            storeName = "kappSun" + String(i);
            kappaSun[1][i] = Number(sessionStorage.getItem(storeName));
            kappaSun[0][i] = Math.exp(kappaSun[1][i]);
            storeName = "pressSun" + String(i);
            pressSun[1][i] = Number(sessionStorage.getItem(storeName));
            pressSun[0][i] = Math.exp(pressSun[1][i]);
            pressSun[2][i] = 0.0; // Don't need Sun's radiation pressure??
            pressSun[3][i] = -99.0; // Don't need Sun's radiation pressure??             
            storeName = "rhoSun" + String(i);
            rhoSun[1][i] = Number(sessionStorage.getItem(storeName));
            rhoSun[0][i] = Math.exp(rhoSun[1][i]);
            storeName = "mmwSun" + String(i);
            mmwSun[i] = Number(sessionStorage.getItem(storeName));
            storeName = "NeSun" + String(i);
            NeSun[1][i] = Number(sessionStorage.getItem(storeName));
            NeSun[0][i] = Math.exp(NeSun[1][i]);
        }

        for (var i = 0; i < numDeps; i++) {
            //console.log(keyTemp[i]);
            storeName = "tempVega" + String(i);
            tempVega[1][i] = Number(sessionStorage.getItem(storeName));
            tempVega[0][i] = Math.exp(tempVega[1][i]);
            storeName = "kappVega" + String(i);
            kappaVega[1][i] = Number(sessionStorage.getItem(storeName));
            kappaVega[0][i] = Math.exp(kappaVega[1][i]);
            storeName = "pressVega" + String(i);
            pressVega[1][i] = Number(sessionStorage.getItem(storeName));
            pressVega[0][i] = Math.exp(pressVega[1][i]);
            pressVega[2][i] = 0.0; // Don't need Sun's radiation pressure??
            pressVega[3][i] = -99.0; // Don't need Sun's radiation pressure??             
            storeName = "rhoVega" + String(i);
            rhoVega[1][i] = Number(sessionStorage.getItem(storeName));
            rhoVega[0][i] = Math.exp(rhoVega[1][i]);
            storeName = "mmwVega" + String(i);
            mmwVega[i] = Number(sessionStorage.getItem(storeName));
            storeName = "NeVega" + String(i);
            NeVega[1][i] = Number(sessionStorage.getItem(storeName));
            NeVega[0][i] = Math.exp(NeVega[1][i]);
        }

    } else {

        //console.log("normal mode - solar structure, ifLineOnly: " + ifLineOnly);
        var k = 1.3806488E-16; // Boltzmann constant in ergs/K
        var logK = Math.log(k);
        //console.log("teffSun " + teffSun);
        //Gray solution
        //tempSun = temperature(numDeps, teffSun, tauRos);
        //Rescaled  kinetic temeprature structure: 
        var tempSun = phxSunTemp(teffSun, numDeps, tauRos);
        //
        // BEGIN Initial guess for Sun section:
        //Now do the same for the Sun, for reference:
        var pGasSun = phxSunPGas(gravSun, numDeps, tauRos);
        var NeSun = phxSunNe(gravSun, numDeps, tauRos, tempSun, kappaScaleSun);
        var kappaSun = phxSunKappa(numDeps, tauRos, kappaScaleSun);
        /*
         //
         //Data amalgamated for several stars from Table 9.2, Observation and Analysis of Stellar Photospheres, 3rd Ed.,
         // David F. Gray ("Dfg")
         //** CAUTION: last two values in list are for logg=4.0, first 4 are for logg=4.6, and rest are for solar logg
         var tempDfg = [3017.0, 3111.0, 3262.0, 3592.0, 4310.0, 4325.0, 4345.0, 4370.0, 4405.0, 4445.0, 4488.0, 4524.0, 4561.0, 4608.0, 4660.0, 4720.0, 4800.0, 4878.0, 4995.0, 5132.0, 5294.0, 5490.0, 5733.0, 6043.0, 6429.0, 6904.0, 7467.0, 7962.0, 8358.0, 8630.0, 8811.0, 9643.0, 12945.0];
         var log10PgDfg = [3.22, 3.89, 4.45, 5.00, 2.87, 3.03, 3.17, 3.29, 3.41, 3.52, 3.64, 3.75, 3.86, 3.97, 4.08, 4.19, 4.30, 4.41, 4.52, 4.63, 4.74, 4.85, 4.95, 5.03, 5.10, 5.15, 5.18, 5.21, 5.23, 5.26, 5.29, 3.76, 3.88];
         var log10PeDfg = [-2.12, -1.51, -0.95, -0.26, -1.16, -1.02, -0.89, -0.78, -0.66, -0.55, -0.44, -0.33, -0.23, -0.12, -0.01, 0.10, 0.22, 0.34, 0.47, 0.61, 0.76, 0.93, 1.15, 1.43, 1.78, 2.18, 2.59, 2.92, 3.16, 3.32, 3.42, 2.96, 3.43];
         var log10KapOverPeDfg = [-0.46, -0.53, -0.64, -0.85, -1.22, -1.23, -1.24, -1.25, -1.26, -1.28, -1.30, -1.32, -1.33, -1.35, -1.37, -1.40, -1.43, -1.46, -1.50, -1.55, -1.60, -1.66, -1.73, -1.81, -1.91, -2.01, -2.11, -2.18, -2.23, -2.25, -2.27, -1.82, -1.73];
         var numDfg = tempDfg.length;
         var log10KapDfg = [];
         var logKapDfg = [];
         var logPgDfg = [];
         var logPeDfg = [];
         log10KapDfg.length = numDfg;
         logKapDfg.length = numDfg;
         logPgDfg.length = numDfg;
         logPgDfg.length = numDfg;
         var pgDfg;
         for (var i = 0; i < numDfg; i++) {
         //Rescale pressures to logg=4.44; assume logP scales with logg through HSE
         if (i <= 3) {
         log10PgDfg[i] = log10PgDfg[i] - 0.2;
         log10PeDfg[i] = log10PeDfg[i] - 0.2;
         }
         if (i >= numDfg - 2) {
         log10PgDfg[i] = log10PgDfg[i] + 0.44;
         log10PeDfg[i] = log10PeDfg[i] + 0.44;
         }
         log10KapDfg[i] = log10KapOverPeDfg[i] + log10PeDfg[i];
         logKapDfg[i] = Math.log(Math.pow(10.0, log10KapDfg[i]));
         //Dress up DFG temp and pressure to look like what State.massDensity expects...
         logPgDfg[i] = Math.log(Math.pow(10.0, log10PgDfg[i]));
         logPeDfg[i] = Math.log(Math.pow(10.0, log10PeDfg[i]));
         //console.log("i " + i + " tempDfg[i] " + tempDfg[i] + " logKapDfg[i] " + logE*logKapDfg[i].toPrecision(3) + " logPgDfg[i] " + logE*logPgDfg[i].toPrecision(3) + " logPeDfg[i] " + logE*logPeDfg[i].toPrecision(3));
         }
         
         //Interpolate DFG data onto our Gray Teff structure:
         // updated temperature structure
         
         var kapDfg2 = [];
         kapDfg2.length = 2;
         kapDfg2[0] = [];
         kapDfg2[1] = [];
         kapDfg2[0].length = numDeps;
         kapDfg2[1].length = numDeps;
         var pressDfg2 = [];
         pressDfg2.length = 4;
         pressDfg2[0] = [];
         pressDfg2[1] = [];
         pressDfg2[2] = [];
         pressDfg2[3] = [];
         pressDfg2[0].length = numDeps;
         pressDfg2[1].length = numDeps;
         pressDfg2[2].length = numDeps;
         pressDfg2[3].length = numDeps;
         var logPeDfg2 = [];
         logPeDfg2.length = numDeps;
         //Prepare simple temperature vector for input to interpol():
         var tempSimp = [];
         tempSimp.length = numDeps;
         for (var i = 0; i < numDeps; i++) {
         tempSimp[i] = tempSun[0][i];
         }
         
         for (var i = 0; i < numDeps; i++) {
         
         if (tempSimp[i] <= tempDfg[0]) {
         kapDfg2[1][i] = logKapDfg[0];
         pressDfg2[1][i] = logPgDfg[0];
         logPeDfg2[i] = logPeDfg[0];
         } else if (tempSimp[i] >= tempDfg[numDfg - 1]) {
         kapDfg2[1][i] = logKapDfg[numDfg - 1];
         pressDfg2[1][i] = logPgDfg[numDfg - 1];
         logPeDfg2[i] = logPeDfg[numDfg - 1];
         } else {
         kapDfg2[1][i] = interpol(tempDfg, logKapDfg, tempSimp[i]);
         pressDfg2[1][i] = interpol(tempDfg, logPgDfg, tempSimp[i]);
         logPeDfg2[i] = interpol(tempDfg, logPeDfg, tempSimp[i]);
         }
         
         kapDfg2[0][i] = Math.exp(kapDfg2[1][i]);
         pressDfg2[0][i] = Math.exp(pressDfg2[1][i]);
         pressDfg2[2][i] = 0.0;
         pressDfg2[3][i] = 0.0;
         //Electron number density, Ne:
         NeDfg2[1][i] = logPeDfg2[i] - tempSun[1][i] - logK;
         NeDfg2[0][i] = Math.exp(NeDfg2[1][i]);
         //console.log("tauRos[1][i] " + logE*tauRos[1][i] + " tempSun[0][i] " + tempSun[0][i] + " kapDfg2[1][i] " + logE*kapDfg2[1][i] + " pressDfg2[1][i] " + logE*pressDfg2[1][i] + " logPeDfg2[i] " + logE*logPeDfg2[i]);
         }
         //for (var i = 0; i < numDeps; i++) {
         //    console.log(" i " + i + " pressDfg2[0][i] " + logE*pressDfg2[1][i] + " kapDfg2[0][i] " + logE*kapDfg2[1][i]);
         //}
         //
         // END initial guess for Sun section
         //
         // *********************
         //
         */
        //Get H I n=2 & n=3 number densities for Balmer and Pashen continuum  for kappa calculation
        // Paschen:
        var ionizedHI = false;
        var chiI1H = 13.6; //eV
        var chiI2H = 1.0e6; //eV //H has no third ionization stage!
        var gw1H = 2.0;
        var gw2H = 1.0; // umm... doesn't exist - no "HIII"
        // n=3 level - Paschen jump
        var lamJump3 = 820.4 * 1.0e-7; //Paschen jump - cm
        var chiLH3 = 12.1; //eV
        var gwLH3 = 2 * 3 * 3; // 2n^2
        var logNumsH3 = [];
        logNumsH3.length = 4;
        logNumsH3[0] = [];
        logNumsH3[1] = [];
        logNumsH3[2] = [];
        logNumsH3[3] = [];
        logNumsH3[0].length = numDeps;
        logNumsH3[1].length = numDeps;
        logNumsH3[2].length = numDeps;
        logNumsH3[3].length = numDeps;
        // n=2 level - Balmer jump
        var lamJump2 = 364.0 * 1.0e-7; //Paschen jump - cm
        var chiLH2 = 10.2; //eV
        var gwLH2 = 2 * 2 * 2; // 2n^2   
        var logNumsH2 = [];
        logNumsH2.length = 4;
        logNumsH2[0] = [];
        logNumsH2[1] = [];
        logNumsH2[2] = [];
        logNumsH2[3] = [];
        logNumsH2[0].length = numDeps;
        logNumsH2[1].length = numDeps;
        logNumsH2[2].length = numDeps;
        logNumsH2[3].length = numDeps;
        var mode;
        mode = 1; //call kappas *with* knowledge of who 
        //console.log("numDeps " + numDeps + " kappaScaleSun " + kappaScaleSun);
        mmwSun = mmwFn(numDeps, tempSun, kappaScaleSun);
        //Now do same for Sun:
        var rhoSun = massDensity(numDeps, tempSun, pGasSun, mmwSun, kappaScaleSun);
        //rhoDfg2 = massDensity(numDeps, tempSun, pressDfg2, mmwSun, kappaScale);
        //logNumsH3 = levelPops(lamJump3, logNH, NeSun, ionizedHI, chiI1H, chiI2H, chiLH3, gw1H, gw2H, gwLH3,
        //        numDeps, kappaScale, tauRos, tempSun, rhoSun);
        //logNumsH2 = levelPops(lamJump2, logNH, NeSun, ionizedHI, chiI1H, chiI2H, chiLH2, gw1H, gw2H, gwLH2,
        //        numDeps, kappaScale, tauRos, tempSun, rhoSun);
        //kappaSun = kappas(mode, numDeps, rhoSun, rhoSun, kappaSun, kappaScaleSun, loggSun, loggSun, teffSun, teffSun, radiusSun, massX, massZSun, tauRos, tempSun, tempSun, logNumsH3, logNumsH2);
//               function(mode, numDeps, rho,     rhoSun,  kappaRosSun, kappaScale,    logg,    loggSun, teff,    teffSun, radius,    massX, massZ,    tauRos, temp,    tempSun)
        pressSun = hydrostatic(numDeps, gravSun, tauRos, kappaSun, tempSun);
        //rhoSun = massDensity(numDeps, tempSun, pressSun, mmwSun, kappaScaleSun);
        //for (var i = 0; i < numDeps; i++) {
        //console.log(" i " + i + " tauRos[1][i] " + logE*tauRos[1][i] + " mmwSun[i] " + mmwSun[i] + " tempSun[0][i] " + tempSun[0][i] + " pressSun[1][i] " + logE*pressSun[1][i] + " kappaSun[1][i] " + logE*kappaSun[1][i] + " rhoSun[1][i] " + logE*rhoSun[1][i]);
        //console.log(" i " + i + " tauRos[1][i] " + logE*tauRos[1][i] + " tempSun[0][i] " + tempSun[0][i]+ " pressDfg2[1][i] " + logE*pressDfg2[1][i] + " kapDfg2[1][i] " + logE*kapDfg2[1][i] + " rhoDfg2[1][i] " + logE*rhoDfg2[1][i]);
        //}
        //Rescaled  kinetic temeprature structure: 
        var tempVega = phxVegaTemp(teffVega, numDeps, tauRos);
        //
        // BEGIN Initial guess for Sun section:
        //Now do the same for the Sun, for reference:
        var pGasVega = phxVegaPGas(gravVega, numDeps, tauRos);
        var NeVega = phxVegaNe(gravVega, numDeps, tauRos, tempVega, kappaScaleVega);
        var kappaVega = phxVegaKappa(numDeps, tauRos, kappaScaleVega);
        mode = 1; //call kappas *with* knowledge of who 
        //console.log("numDeps " + numDeps + " kappaScaleSun " + kappaScaleSun);
        mmwVega = mmwFn(numDeps, tempVega, kappaScaleVega);
        //Now do same for Sun:
        var rhoVega = massDensity(numDeps, tempVega, pGasVega, mmwVega, kappaScaleVega);

        pressVega = hydrostatic(numDeps, gravVega, tauRos, kappaVega, tempVega);
        //
    } //end solar structure ifLineOnly




//Stellar structure:
//
// initializations:
    var mmw = [];
    mmw.length = numDeps;
    var temp = [];
    temp.length = 2;
    temp[0] = [];
    temp[1] = [];
    temp[0].length = numDeps;
    temp[1].length = numDeps;
    var kappa = [];
    kappa.length = 2;
    kappa[0] = [];
    kappa[1] = [];
    kappa[0].length = numDeps;
    kappa[1].length = numDeps;
    var press = [];
    press.length = 4;
    press[0] = [];
    press[1] = [];
    press[2] = [];
    press[3] = [];
    press[0].length = numDeps;
    press[1].length = numDeps;
    press[2].length = numDeps;
    press[3].length = numDeps;
    var rho = [];
    rho.length = 2;
    rho[0] = [];
    rho[1] = [];
    rho[0].length = numDeps;
    rho[1].length = numDeps;
    var Ne = [];
    Ne.length = 2;
    Ne[0] = [];
    Ne[1] = [];
    Ne[0].length = numDeps;
    Ne[1].length = numDeps;

//
    if (ifLineOnly === true) {

        //console.log("ifLineOnly mode - stellar structure, ifLineOnly: " + ifLineOnly);

        //We've already stored the stellar structure - just retrieve logarithmic quantities
        // and reconstruct linear quantities

        for (var i = 0; i < numDeps; i++) {
            //console.log(keyTemp[i]);
            storeName = "temp" + String(i);
            temp[1][i] = Number(sessionStorage.getItem(storeName));
            temp[0][i] = Math.exp(temp[1][i]);
            storeName = "kapp" + String(i);
            kappa[1][i] = Number(sessionStorage.getItem(storeName));
            kappa[0][i] = Math.exp(kappa[1][i]);
            storeName = "press" + String(i);
            press[1][i] = Number(sessionStorage.getItem(storeName));
            press[0][i] = Math.exp(press[1][i]);
            storeName = "pRad" + String(i);
            press[3][i] = Number(sessionStorage.getItem(storeName));
            press[2][i] = Math.exp(press[3][i]);
            storeName = "rho" + String(i);
            rho[1][i] = Number(sessionStorage.getItem(storeName));
            rho[0][i] = Math.exp(rho[1][i]);
            storeName = "mmw" + String(i);
            mmw[i] = Number(sessionStorage.getItem(storeName));
            storeName = "Ne" + String(i);
            Ne[1][i] = Number(sessionStorage.getItem(storeName));
            Ne[0][i] = Math.exp(Ne[1][i]);
        }

    } else {

        //console.log("normal mode - stellar structure, ifLineOnly: " + ifLineOnly);

        ////Gray kinetic temeprature structure:
        //temp = temperature(numDeps, teff, tauRos);
        //Rescaled  kinetic temeprature structure: 
        var F0Vtemp = 7300.0;  // Teff of F0 V star (K)       
        if (teff < F0Vtemp) {
            //We're a cool star! - rescale from Sun!
            temp = phxSunTemp(teff, numDeps, tauRos);
        } else if (teff >= F0Vtemp) {
            //We're a HOT star! - rescale from Vega
            temp = phxVegaTemp(teff, numDeps, tauRos);
        }

        //Scaled from Phoenix solar model:
        var guessKappa = [];
        guessKappa.length = 2;
        guessKappa[0] = [];
        guessKappa[1] = [];
        guessKappa[0].length = numDeps;
        guessKappa[1].length = numDeps;
        var guessPGas = [];
        guessPGas.length = 2;
        guessPGas[0] = [];
        guessPGas[1] = [];
        guessPGas[0].length = numDeps;
        guessPGas[1].length = numDeps;
        var guessRho = [];
        guessRho.length = 2;
        guessRho[0] = [];
        guessRho[1] = [];
        guessRho[0].length = numDeps;
        guessRho[1].length = numDeps;



        if (teff < F0Vtemp) {
            //We're a cool star - rescale from Sun!
            guessPGas = phxSunPGas(grav, numDeps, tauRos);
            Ne = phxSunNe(grav, numDeps, tauRos, temp, kappaScale);
            guessKappa = phxSunKappa(numDeps, tauRos, kappaScale);
        } else if (teff >= F0Vtemp) {
            //We're a HOT star!! - rescale from Vega
            guessPGas = phxVegaPGas(grav, numDeps, tauRos);
            Ne = phxVegaNe(grav, numDeps, tauRos, temp, kappaScale);
            guessKappa = phxVegaKappa(numDeps, tauRos, kappaScale);
        }

        //        
// mean molecular weight and Ne for Star & Sun
        mmw = mmwFn(numDeps, temp, kappaScale);
        var guessRho = massDensity(numDeps, temp, guessPGas, mmw, kappaScale);
        //Ne = NeFn(numDeps, temp, NeDfg2, kappaScale);
        /*
         mode = 0;  //call kappas without knowledge of rho
         
         var kappa = kappas(mode, numDeps, rho, rhoSun, kappaScale, logg, loggSun, teff, teffSun, radius, massX, massZ, tauRos, temp, tempSun);
         var kappaSun = kappas(mode, numDeps, rho, rhoSun, kappaScaleSun, loggSun, loggSun, teffSun, teffSun, radiusSun, massX, massZSun, tauRos, tempSun, tempSun);
         */
        mode = 1; //call kappas with knowledge of rho
        logNumsH3 = levelPops(lamJump3, logNH, Ne, ionizedHI, chiI1H, chiI2H, chiLH3, gw1H, gw2H, gwLH3,
                numDeps, kappaScale, tauRos, temp, guessRho);
        logNumsH2 = levelPops(lamJump2, logNH, Ne, ionizedHI, chiI1H, chiI2H, chiLH2, gw1H, gw2H, gwLH2,
                numDeps, kappaScale, tauRos, temp, guessRho);
        if (teff < F0Vtemp) {
            //console.log(" ************** Main kappa cool branch");
            kappa = kappas(mode, numDeps, guessRho, rhoSun, kappaSun, kappaScale, logg, loggSun,
                    teff, teffSun, radius, massX, massZ, tauRos, temp, tempSun, logNumsH3, logNumsH2);
        } else if (teff >= F0Vtemp) {
            //console.log(" *************** Main kappa hot branch");
            kappa = kappas(mode, numDeps, guessRho, rhoVega, kappaVega, kappaScale, logg, loggSun,
                    teff, teffSun, radius, massX, massZ, tauRos, temp, tempVega, logNumsH3, logNumsH2);
        }
        ////Test:
        //var kappa = [];
        //kappa.length = 2;
        //kappa[0] = [];
        //kappa[1] = [];
        //kappa[0].length = numDeps;
        //kappa[1].length = numDeps;
       // for (var i = 0; i < numDeps; i++) {
            //kappa[0][i] = guessKappa[0][i];
            //kappa[1][i] = guessKappa[1][i];
            //console.log(" " + i + " " + logE * guessRho[1][i] + " " + logE * rhoVega[1][i] + " " + logE * kappaVega[1][i] +
            //        " " + temp[0][i] + " " + tempVega[0][i] + " " + logE * kappa[1][i]
             //       + " Ne " + logE * Ne[1][i] + " logNumsH3 " + logE * logNumsH3[1][i] + " logNumsH2 " + logE * logNumsH2[1][i]);
       // }
        //Next solve hydrostatic eq for P scale on the tau scale - need to pick a depth dependent kappa value!
        //   - scale kapp_Ross with log(g) from solar value? - Kramers opacity law?
        //   - dP/dTau = g/kappa
        //press is a 4 x numDeps array:
        // rows 0 & 1 are linear and log *gas* pressure, respectively
        // rows 2 & 3 are linear and log *radiation* pressure
       // console.log("Calling hydrostat for target:");
        press = hydrostatic(numDeps, grav, tauRos, kappa, temp);
        // Then solve eos for the rho scale - need to pick a mean molecular weight, mu
        rho = massDensity(numDeps, temp, press, mmw, kappaScale);
        // Then construct geometric depth scale from tau, kappa and rho
        //for (var i = 0; i < numDeps; i++) {
        //    console.log(" i " + i + " tauRos[1][i] " + logE*tauRos[1][i] + " mmw[i] " + mmwSun[i] + " temp[0][i] " + temp[0][i] + " press[1][i] " + logE*press[1][i] + " kappa[1][i] " + logE*kappa[1][i] + " rho[1][i] " + logE*rho[1][i]);
        //}
        //compute kappas again with in situ densities thsi time:
        mode = 1; //call kappas ** with ** knowledge of rho
        logNumsH3 = levelPops(lamJump3, logNH, Ne, ionizedHI, chiI1H, chiI2H, chiLH3, gw1H, gw2H, gwLH3,
               numDeps, kappaScale, tauRos, temp, rho);
        logNumsH2 = levelPops(lamJump2, logNH, Ne, ionizedHI, chiI1H, chiI2H, chiLH2, gw1H, gw2H, gwLH2,
                numDeps, kappaScale, tauRos, temp, rho);
         if (teff < F0Vtemp) {
             kappa = kappas(mode, numDeps, rho, rhoSun, kappaSun, kappaScale, logg, loggSun,
                     teff, teffSun, radius, massX, massZ, tauRos, temp, tempSun, logNumsH3, logNumsH2);
        } else if (teff >= F0Vtemp) {
            kappa = kappas(mode, numDeps, rho, rhoVega, kappaVega, kappaScale, logg, loggSun,
                    teff, teffSun, radius, massX, massZ, tauRos, temp, tempVega, logNumsH3, logNumsH2);
         }
        //double kappaSun[][] = Kappas.kappas(numDeps, kappaScaleSun, teffSun, teffSun, loggSun, loggSun);
        //kappaSun = kappas(mode, numDeps, rho, rhoSun, kappaScaleSun, loggSun, loggSun, teffSun, teffSun, radiusSun, massX, massZSun, tauRos, tempSun, tempSun);
        // Then construct geometric depth scale from tau, kappa and rho

        var depths = depthScale(numDeps, tauRos, kappa, rho);
        //for (var i = 0; i < numDeps; i++) {
        //    console.log("depths[i] " + (1.0e-5 * depths[i]));
        //}
        var numTCorr = 0; //test

        // updated temperature structure
        var newTemp = [];
        newTemp.length = 2;
        newTemp[0] = [];
        newTemp[1] = [];
        newTemp[0].length = numDeps;
        newTemp[1].length = numDeps;
        //console.log("Before Tcorr block: switchPerf " + switchPerf + " ifTcorr " + ifTcorr + " ifConvec " + ifConvec + " ifVoigt " + ifVoigt + " ifLinePlot " + ifLinePlot);
        if (ifTcorr === true) {
//console.log(" " + logE * tauRos[1][iTau] + " " + temp[0][iTau]);
            for (var i = 0; i < numTCorr; i++) {
//newTemp = TCorr.tCorr(numDeps, tauRos, temp);
                newTemp = mgTCorr(numDeps, teff, tauRos, temp, rho, kappa);
                for (var iTau = 0; iTau < numDeps; iTau++) {
//console.log(" " + logE*tauRos[1][iTau] + " " + temp[0][iTau]);
                    temp[1][iTau] = newTemp[1][iTau];
                    temp[0][iTau] = newTemp[0][iTau];
                    //console.log(" " + logE*tauRos[1][iTau] + " " + temp[0][iTau]);
                }
            }
        }

        if (ifConvec === true) {
//Convection:
// Teff below which stars are convective.  
//  - has to be finessed because Convec.convec() does not work well :-(
            var convTeff = 6500.0;
            var convTemp = [];
            convTemp.length = 2;
            convTemp[0] = [];
            convTemp[1] = [];
            convTemp[0].length = numDeps;
            convTemp[1].length = numDeps;
            if (teff < convTeff) {
                convTemp = convec(numDeps, tauRos, temp, press, rho, kappa, kappaSun, kappaScale, teff, logg);
                for (var iTau = 0; iTau < numDeps; iTau++) {
                    temp[1][iTau] = convTemp[1][iTau];
                    temp[0][iTau] = convTemp[0][iTau];
                }

            }
        }


        if ((ifTcorr === true) || (ifConvec === true)) {
//Recall hydrostat with updates temps            
//Recall state withupdated Press                    
//recall kappas withupdates rhos
//Recall depths with re-updated kappas
            press = hydrostatic(numDeps, grav, tauRos, kappa, temp);
            rho = massDensity(numDeps, temp, press, mmw, kappaScale);
            //pressSun = hydrostatic(numDeps, gravSun, tauRos, kappaSun, tempSun, logRadius);
            //rhoSun = massDensity(numDeps, tempSun, pressSun, kappaScaleSun);
            mode = 1; //call kappas ** with ** knowledge of rho
            logNumsH3 = levelPops(lamJump3, logNH, Ne, ionizedHI, chiI1H, chiI2H, chiLH3, gw1H, gw2H, gwLH3,
                    numDeps, kappaScale, tauRos, temp, rho);
            logNumsH2 = levelPops(lamJump2, logNH, Ne, ionizedHI, chiI1H, chiI2H, chiLH2, gw1H, gw2H, gwLH2,
                    numDeps, kappaScale, tauRos, temp, rho);
            if (teff < F0Vtemp) {
                kappa = kappas(mode, numDeps, rho, rhoSun, kappaSun, kappaScale, logg, loggSun,
                        teff, teffSun, radius, massX, massZ, tauRos, temp, tempSun, logNumsH3, logNumsH2);
            } else if (teff >= F0Vtemp) {
                kappa = kappas(mode, numDeps, rho, rhoVega, kappaVega, kappaScale, logg, loggSun,
                        teff, teffSun, radius, massX, massZ, tauRos, temp, tempVega, logNumsH3, logNumsH2);
            }
            //double kappaSun[][] = Kappas.kappas(numDeps, kappaScaleSun, teffSun, teffSun, loggSun, loggSun);
            //kappaSun = kappas(mode, numDeps, rho, rhoSun, kappaScaleSun, loggSun, loggSun, teffSun, teffSun, radiusSun, massX, massZSun, tauRos, tempSun, tempSun);
            //depths = depthScale(numDeps, tauRos, kappa, rho);
        }

    } // end stellar struture ifLineOnly



//
//
// var depthsSun = depthScale(numDeps, tauRos, kappaSun, rhoSun);

// Set up theta grid
//  cosTheta is a 2xnumThetas array:
// row 0 is used for Gaussian quadrature weights
// row 1 is used for cos(theta) values
// Gaussian quadrature:
// Number of angles, numThetas, will have to be determined after the fact
    var cosTheta = thetas();
    var numThetas = cosTheta[0].length;
    // Solve formal sol of rad trans eq for outgoing surfaace I(0, theta)

    var lineMode;
    //
    // ************
    //
    //  Spectrum synthesis section:
    //  
    //  
    //  
    // Limb darkening:
    // Establish continuum wavelength grid:
    var lambdaScale = lamgrid(numLams, lamSetup); //nm
    // Set up multi-Gray continuum info:
    var isCool = 7300.0; //Class A0


    //Set up multi-gray opacity:
    // lambda break-points and gray levels:
    // No. multi-gray bins = num lambda breakpoints +1
    var minLambda = 30.0; //nm
    var maxLambda = 1.0e6; //nm
    var maxNumBins = 11;
    var grayLevelsEpsilons = grayLevEps(maxNumBins, minLambda, maxLambda, teff, isCool);
    //Find actual number of multi-gray bins:
    var numBins = 0; //initialization
    for (var i = 0; i < maxNumBins; i++) {
        if (grayLevelsEpsilons[0][i] < maxLambda) {
            numBins++;
        }
    }

//
//Line list:
    var numLines = 14;
    //var numLines = 1;  //debug
    var listName = [];
    listName.length = numLines;
    var listElement = [];
    listElement.length = numLines;
    var listLam0 = []; // nm
    listLam0.length = numLines;
    var listMass = []; // amu
    listMass.length = numLines;
    var listLogGammaCol = [];
    listLogGammaCol.length = numLines;
    //abundance in logarithmic A12 sysytem
    var listA12 = [];
    listA12.length = numLines;
    //Log of unitless oscillator strength, f 
    var listLogf = [];
    listLogf.length = numLines;
    //Ground state ionization E - Stage I (eV) 
    var listChiI1 = [];
    listChiI1.length = numLines;
    //Ground state ionization E - Stage II (eV)
    var listChiI2 = [];
    listChiI2.length = numLines;
    //Excitation E of lower E-level of b-b transition (eV)
    var listChiL = [];
    listChiL.length = numLines;
    //Unitless statisital weight, Ground state ionization E - Stage I
    var listGw1 = [];
    listGw1.length = numLines;
    //Unitless statisital weight, Ground state ionization E - Stage II
    var listGw2 = [];
    listGw2.length = numLines;
    //Unitless statisital weight, lower E-level of b-b transition                 
    var listGwL = [];
    listGwL.length = numLines;
    //double[] listGwU For now we'll just set GwU to 1.0
    // Is stage II?
    var listIonized = [];
    listIonized.length = numLines;
    //
    //Atomic Data sources:
    //http://www.nist.gov/pml/data/asd.cfm
    // Masses: http://www.chemicalelements.com/show/mass.html
    //Solar abundances: http://arxiv.org/pdf/0909.0948.pdf
    //   - Asplund, M., Grevesse, N., Sauval, A., Scott, P., 2009, arXiv:0909.0948v1
    //   
    //   
    //    *** CAUTION: THese should be in order of increasing wavelength (lam0) for labeling purposes in graphical output
    //    
    //    
    //    
    //    
    //CaII K
    listName[0] = "Ca II K";
    listElement[0] = "Ca";
    listLam0[0] = 393.366;
    listA12[0] = 6.34;
    listLogf[0] = -0.166;
    listChiI1[0] = 6.113;
    listChiI2[0] = 11.872;
    //This is necessary for consistency with Stage II treatment of user-defined spectral line:
    listChiL[0] = 0.01 + listChiI1[0];
    listMass[0] = 40.078;
    listLogGammaCol[0] = 0.5;
    listGw1[0] = 1.0;
    listGw2[0] = 2.0;
    listGwL[0] = 2.0;
    listIonized[0] = true;
    
     //CaII H
     listName[1] = "Ca II H";
     listElement[1] = "Ca";
     listLam0[1] = 396.847;
     listA12[1] = 6.34;
     listLogf[1] = -0.482;
     listChiI1[1] = 6.113;
     listChiI2[1] = 11.872;
     //This is necessary for consistency with Stage II treatment of user-defined spectral line:
     listChiL[1] = 0.01 + listChiI1[1];
     listMass[1] = 40.078;
     listLogGammaCol[1] = 0.5;
     listGw1[1] = 1.0;
     listGw2[1] = 2.0;
     listGwL[1] = 2.0;
     listIonized[1] = true;
     //Fe I 4045
     listName[2] = "Fe I";
     listElement[2] = "Fe";
     listLam0[2] = 404.581;
     listA12[2] = 7.50; //??????
     listLogf[2] = -0.674;
     listChiI1[2] = 7.902;
     listChiI2[2] = 16.199;
     listChiL[2] = 1.485;
     listMass[2] = 55.845;
     listLogGammaCol[2] = 0.0;
     listGw1[2] = 1.0;
     listGw2[2] = 1.0;
     listGwL[2] = 9.0;
     listIonized[2] = false;
     //Hdelta
     listName[3] = "H I <em>&#948</em>";
     listElement[3] = "H";
     listLam0[3] = 410.174;
     listA12[3] = 12.0; //By definition - it's Hydrogen
     listLogf[3] = -1.655;
     listChiI1[3] = 13.6;
     listChiI2[3] = 1.0e6; //Set very high arbitrary value - there is no "H III"!
     listChiL[3] = 10.2;
     listMass[3] = 1.0;
     listLogGammaCol[3] = 1.0;
     listGw1[3] = 2.0; // 2n^2
     listGw2[3] = 1.0;
     listGwL[3] = 8.0; // 2n^2
     listIonized[3] = false;
     //CaI 4227
     listName[4] = "Ca I";
     listElement[4] = "Ca";
     listLam0[4] = 422.673;
     listA12[4] = 6.34;
     listLogf[4] = 0.243;
     listChiI1[4] = 6.113;
     listChiI2[4] = 11.872;
     listChiL[4] = 0.00;
     listMass[4] = 40.078;
     listLogGammaCol[4] = 1.0;
     listGw1[4] = 1.0;
     listGw2[4] = 1.0;
     listGwL[4] = 1.0;
     listIonized[4] = false;
     //Fe I 4271
     listName[5] = "Fe I";
     listElement[5] = "Fe";
     listLam0[5] = 427.176;
     listA12[5] = 7.50; //??????
     listLogf[5] = -1.118;
     listChiI1[5] = 7.902;
     listChiI2[5] = 16.199;
     listChiL[5] = 1.485;
     listMass[5] = 55.845;
     listLogGammaCol[5] = 0.0;
     listGw1[5] = 1.0;
     listGw2[5] = 1.0;
     listGwL[5] = 9.0;
     listIonized[5] = false;
     //Hgamma
     listName[6] = "H I <em>&#947</em>";
     listElement[6] = "H";
     listLam0[6] = 434.047;
     listA12[6] = 12.0; //By definition - it's Hydrogen
     listLogf[6] = -1.350;
     listChiI1[6] = 13.6;
     listChiI2[6] = 1.0e6; //Set very high arbitrary value - there is no "H III"!
     listChiL[6] = 10.2;
     listMass[6] = 1.0;
     listLogGammaCol[6] = 1.0;
     listGw1[6] = 2.0; // 2n^2
     listGw2[6] = 1.0;
     listGwL[6] = 8.0; // 2n^2
     listIonized[6] = false;
     //He I 4387
     listName[7] = "He I";
     listElement[7] = "He";
     listLam0[7] = 438.793;
     listA12[7] = 10.93; //??????
     listLogf[7] = -1.364;
     listChiI1[7] = 24.587;
     listChiI2[7] = 54.418;
     listChiL[7] = 21.218;
     listMass[7] = 4.003;
     listLogGammaCol[7] = 0.0;
     listGw1[7] = 1.0;
     listGw2[7] = 1.0;
     listGwL[7] = 3.0;
     listIonized[7] = false;
     //He I 4471
     listName[8] = "He I";
     listElement[8] = "He";
     listLam0[8] = 447.147;
     listA12[8] = 10.93; //??????
     listLogf[8] = -0.986;
     listChiI1[8] = 24.587;
     listChiI2[8] = 54.418;
     listChiL[8] = 20.964;
     listMass[8] = 4.003;
     listLogGammaCol[8] = 0.0;
     listGw1[8] = 1.0;
     listGw2[8] = 1.0;
     listGwL[8] = 5.0;
     listIonized[8] = false;
     //Hbeta
     listName[9] = "H I <em>&#946</em>";
     listElement[9] = "H";
     listLam0[9] = 486.128;
     listA12[9] = 12.0; //By definition - it's Hydrogen
     listLogf[9] = -0.914;
     listChiI1[9] = 13.6;
     listChiI2[9] = 1.0e6; //Set very high arbitrary value - there is no "H III"!
     listChiL[9] = 10.2;
     listMass[9] = 1.0;
     listLogGammaCol[9] = 1.0;
     listGw1[9] = 2.0; // 2n^2
     listGw2[9] = 1.0;
     listGwL[9] = 8.0; // 2n^2
     listIonized[9] = false;
     //MgIb1
     listName[10] = "Mg I <em>b</em><sub>1</sub>";
     listElement[10] = "Mg";
     listLam0[10] = 518.360; //nm
     listA12[10] = 7.60; // Grevesse & Sauval 98
     listLogf[10] = -0.867;
     listChiI1[10] = 7.646;
     listChiI2[10] = 15.035;
     listChiL[10] = 2.717;
     listMass[10] = 24.305;
     listLogGammaCol[10] = 1.0;
     listGw1[10] = 1.0;
     listGw2[10] = 1.0;
     listGwL[10] = 5.0;
     listIonized[10] = false;
     //NaID2
     listName[11] = "Na I <em>D</em><sub>2</sub>";
     listElement[11] = "Na";
     listLam0[11] = 588.995;
     listA12[11] = 6.24; // Grevesse & Sauval 98
     listLogf[11] = -0.193;
     listChiI1[11] = 5.139;
     listChiI2[11] = 47.286;
     listChiL[11] = 0.0;
     listMass[11] = 22.990;
     listLogGammaCol[11] = 1.0;
     listGw1[11] = 2.0;
     listGw2[11] = 1.0;
     listGwL[11] = 2.0;
     listIonized[11] = false;
     //NaID1
     listName[12] = "Na I <em>D</em><sub>1</sub>";
     listElement[12] = "Na";
     listLam0[12] = 589.592; //nm
     listA12[12] = 6.24; // Grevesse & Sauval 98    
     listLogf[12] = -0.495;
     listChiI1[12] = 5.139;
     listChiI2[12] = 47.286;
     listChiL[12] = 0.0;
     listMass[12] = 22.990;
     listLogGammaCol[12] = 1.0;
     listGw1[12] = 2.0;
     listGw2[12] = 1.0;
     listGwL[12] = 2.0;
     listIonized[12] = false;
     //Halpha
     listName[13] = "H I <em>&#945</em>";
     listElement[13] = "H";
     listLam0[13] = 656.282;
     listA12[13] = 12.0; //By definition - it's Hydrogen
     listLogf[13] = -0.193;
     listChiI1[13] = 13.6;
     listChiI2[13] = 1.0e6; //Set very high arbitrary value - there is no "H III"!
     listChiL[13] = 10.2;
     listMass[13] = 1.0;
     listLogGammaCol[13] = 1.0;
     listGw1[13] = 2.0; // 2n^2
     listGw2[13] = 1.0;
     listGwL[13] = 8.0; // 2n^2
     listIonized[13] = false;
     
//
//
//
//   **** END line list
//
//
//
    //if Hydrogen or Helium, kappaScale should be unity for these purposes:
    var kappaScaleList = 1.0; //initialization

    //Notes
    //
    //CAUTION: This treatment expects numPoints (number of wavelengths, lambda) to be the same for *all* spectral lines!
    var listNumCore = 5; //per wing
    var listNumWing = 10; // half-core
    //int numWing = 0;  //debug
    var listNumPoints = 2 * (listNumCore + listNumWing) - 1; // + 1;  //Extra wavelength point at end for monochromatic continuum tau scale

    //default initializations:

    var numMaster = numLams + (numLines * listNumPoints); //total size (number of wavelengths) of master lambda & total kappa arrays 
    var masterLams = [];
    masterLams.length = numMaster;
    var masterIntens = [];
    masterIntens.length = numMaster;
    //Can't avoid Array constructor here:
    for (var i = 0; i < numMaster; i++) {
        masterIntens[i] = new Array(numThetas);
    }

    var masterFlux = [];
    masterFlux.length = 2;
    masterFlux[0] = [];
    masterFlux[0].length = numMaster;
    masterFlux[1] = [];
    masterFlux[1].length = numMaster;
    var numColors = 5;
    var colors = [];
    colors.length = numColors;
    var thisTau = [];
    thisTau.length = 2;
    thisTau[0] = [];
    thisTau[0].length = numDeps;
    thisTau[1] = [];
    thisTau[1].length = numDeps;
    if (ifLineOnly === true) {

        //console.log("ifLineOnly mode - rad field, ifLineOnly: " + ifLineOnly);

        for (var il = 0; il < numMaster; il++) {
            //console.log(keyTemp[i]);
            storeName = "lambda" + String(il);
            masterLams[il] = Number(sessionStorage.getItem(storeName));
            storeName = "fLambda" + String(il);
            masterFlux[1][il] = Number(sessionStorage.getItem(storeName));
            masterFlux[0][il] = Math.exp(masterFlux[1][il]);
            for (var it = 0; it < numThetas; it++) {
                storeName = "iLambda" + String(il) + "_" + String(it);
                masterIntens[il][it] = Number(sessionStorage.getItem(storeName));
                masterIntens[il][it] = Math.exp(masterIntens[il][it]); //logs were stores
            }
        }

        colors[0] = Number(sessionStorage.getItem("UxmBx"));
        colors[1] = Number(sessionStorage.getItem("BmV"));
        colors[2] = Number(sessionStorage.getItem("VmR"));
        colors[3] = Number(sessionStorage.getItem("VmI"));
        colors[4] = Number(sessionStorage.getItem("RmI"));
        //We've already stored the overall intensity and flux distributions - just retrieve the quantities

    } else {

        //console.log("normal mode - rad field, ifLineOnly: " + ifLineOnly);

        var numNow = numLams; //initialize dynamic counter of how many array elements are in use
        //double[][] logMasterKaps = new double[numMaster][numDeps];
        var logMasterKaps = [];
        logMasterKaps.length = numMaster;
        // Can't avoid Array constructor here:
        for (var i = 0; i < numMaster; i++) {
            logMasterKaps[i] = new Array(numDeps);
        }
//System.out.println("numLams " + numLams + " numLines " + numLines + " listNumPoints " + listNumPoints);
//System.out.println("numMaster " + numMaster + " numNow " + numNow);
//seed masterLams and logMasterKaps with continuum SED lambdas and kapaps:
//This just initializes the first numLams of the numMaster elements
//Also - put in multi-Gray opacities here:
//Find which gray level bin the spectrum synthesis region starts in - assume that the first gray-level bin
// is always at a shorter wavelength than the start of the synthesis region:
        var whichBin = 0; //initialization
        for (var iB = 0; iB < numBins; iB++) {
            if (grayLevelsEpsilons[0][iB] >= lambdaScale[0]) {
                whichBin = iB; //found it!
                break;
            }
        }
//System.out.println("starting whichBin " + whichBin);

//First wavelength definitely falls in first found bin:
        masterLams[0] = lambdaScale[0];
        for (var iD = 0; iD < numDeps; iD++) {
            logMasterKaps[0][iD] = kappa[1][iD]; // + Math.log(grayLevelsEpsilons[1][0]);
            //console.log(" iD " + iD + " tempSun[0][i] " + tempSun[0][i] + " pressSun[0][i] " + pressSun[0][i] + " kappaSun[0][iD] " + kappaSun[0][iD] + " rhoSun[0][iD] " + rhoSun[0][iD]);
        }
        for (var iL = 1; iL < numLams; iL++) {
            masterLams[iL] = lambdaScale[iL];
            //System.out.println("iL " + iL + " lambdaScale[iL] " + lambdaScale[iL] + " whichBin+1 " + (whichBin + 1) + " grayLevelsEpsilons[0][whichBin + 1] " + grayLevelsEpsilons[0][whichBin + 1]);
            if ((lambdaScale[iL] >= grayLevelsEpsilons[0][whichBin + 1])
                    && (lambdaScale[iL - 1] < grayLevelsEpsilons[0][whichBin + 1])
                    && (whichBin < numBins - 1)) {
                whichBin++;
                //System.out.println("whichBin " + whichBin);
            }
            for (var iD = 0; iD < numDeps; iD++) {
                logMasterKaps[iL][iD] = kappa[1][iD]; // + Math.log(grayLevelsEpsilons[1][whichBin]);
            }
        }
//initialize the rest with dummy values
        for (var iL = numLams; iL < numMaster; iL++) {
            masterLams[iL] = lambdaScale[numLams - 1];
            for (var iD = 0; iD < numDeps; iD++) {
                logMasterKaps[iL][iD] = kappa[1][iD];
            }
        }

//Stuff for the the Teff recovery test:
        var lambda1, lambda2, fluxSurfBol, logFluxSurfBol, listLam0nm;
        fluxSurfBol = 0;
        for (var iLine = 0; iLine < numLines; iLine++) {

            //if H or He, make sure kappaScale is unity:
            if ((listElement[iLine] === "H") ||
                    (listElement[iLine] === "He")) {
                kappaScaleList = 1.0;
            } else {
                kappaScaleList = kappaScale;
            }
//System.out.println("iLine " + iLine + " numNow " + numNow);
            var listLogN = (listA12[iLine] - 12.0) + logNH;
            listLam0nm = listLam0[iLine] * 1.0e-7; // nm to cm
            var listLinePoints = lineGrid(listLam0nm, listMass[iLine], xiT, numDeps, teff, listNumCore, listNumWing,
                    logGammaCol, tauRos, temp, press, tempSun, pressSun);
            // Gaussian + Lorentzian approximation to profile (voigt()):
            //var listLineProf = voigt(listLinePoints, listLam0nm, listLogGammaCol[iLine],
            //        numDeps, teff, tauRos, temp, press, tempSun, pressSun);
            // // Real Voigt fn profile (voigt2()):        
            var listLineProf = voigt(listLinePoints, listLam0nm, listLogGammaCol[iLine],
                    numDeps, teff, tauRos, temp, press, tempSun, pressSun);
            //double[][] listLogNums = LevelPops.levelPops(listLam0nm, listLogN, Ne, ionized, listChiI[iLine], listChiL[iLine], 
            //        numDeps, kappaScale, tauRos, temp, rho);
            var listLogNums = levelPops(listLam0nm, listLogN, Ne, listIonized[iLine], listChiI1[iLine],
                    listChiI2[iLine], listChiL[iLine], listGw1[iLine], listGw2[iLine], listGwL[iLine],
                    numDeps, kappaScaleList, tauRos, temp, rho);
            var listLogKappaL = lineKap(listLam0nm, listLogNums, listLogf[iLine], listLinePoints, listLineProf,
                    numDeps, kappaScaleList, tauRos, temp, rhoSun);
            //int listNumPoints = listLinePoints[0].length; // + 1;  //Extra wavelength point at end for monochromatic continuum tau scale
            //double logTauL[][] = LineTau2.tauLambda(numDeps, listNumPoints, logKappaL,
            //        kappa, tauRos, rho, logg);
            var listLineLambdas = [];
            listLineLambdas.length = listNumPoints;
            for (var il = 0; il < listNumPoints; il++) {
// // lineProf[iLine][*] is DeltaLambda from line centre in cm
// if (il === listNumPoints - 1) {
//    listLineLambdas[il] = listLam0nm; // Extra row for line centre continuum taus scale
// } else {
//lineLambdas[il] = (1.0E7 * linePoints[iLine][il]) + lam0; //convert to nm
                listLineLambdas[il] = listLinePoints[0][il] + listLam0nm;
                // }
            }

            var masterLamsOut = masterLambda(numLams, numMaster, numNow, masterLams, listNumPoints, listLineLambdas);
            var logMasterKapsOut = masterKappa(numDeps, numLams, numMaster, numNow, masterLams, masterLamsOut, logMasterKaps, listNumPoints, listLineLambdas, listLogKappaL);
            numNow = numNow + listNumPoints;
            //update masterLams and logMasterKaps:
            for (var iL = 0; iL < numNow; iL++) {
                masterLams[iL] = masterLamsOut[iL];
                for (var iD = 0; iD < numDeps; iD++) {
//Still need to put in multi-Gray levels here:
                    logMasterKaps[iL][iD] = logMasterKapsOut[iL][iD];
                    //if (iD === 36) {
                    //    System.out.println("iL " + iL + " masterLams[iL] " + masterLams[iL] + " logMasterKaps[iL][iD] " + logMasterKaps[iL][iD]);
                    //}
                }
            }
        } //numLines loop

//int numMaster = masterLams.length;
        var logTauMaster = tauLambda(numDeps, numMaster, logMasterKaps,
                kappa, tauRos);
        //Evaluate formal solution of rad trans eq at each lambda throughout line profile
        // Initial set to put lambda and tau arrays into form that formalsoln expects
        //double[] masterLambdas = new double[numMaster];
        //double[][] masterIntens = new double[numMaster][numThetas];

        var masterIntensLam = [];
        masterIntensLam.length = numThetas;
        var masterFluxLam = [];
        masterFluxLam.length = 2;
        //
        lineMode = false; //no scattering for overall SED

        for (var il = 0; il < numMaster; il++) {

//                        // lineProf[0][*] is DeltaLambda from line centre in cm
//                        if (il === listNumPoints - 1) {
//                            lineLambdas[il] = lam0; // Extra row for line centre continuum taus scale
//                        } else {
//lineLambdas[il] = (1.0E7 * linePoints[0][il]) + lam0; //convert to nm
//masterLambdas[il] = masterLams[il];
//                        }
            for (var id = 0; id < numDeps; id++) {
                thisTau[1][id] = logTauMaster[il][id];
                thisTau[0][id] = Math.exp(logTauMaster[il][id]);
            } // id loop

            masterIntensLam = formalSoln(numDeps,
                    cosTheta, masterLams[il], thisTau, temp, lineMode);
            masterFluxLam = flux2(masterIntensLam, cosTheta);
            for (var it = 0; it < numThetas; it++) {
                masterIntens[il][it] = masterIntensLam[it];
                //System.out.println(" il " + il + " it " + it + " logIntens " + logE*Math.log(lineIntensLam[it]) );
            } //it loop - thetas

            masterFlux[0][il] = masterFluxLam[0];
            masterFlux[1][il] = masterFluxLam[1];
            //System.out.println("il " + il + " masterLams[il] " + masterLams[il] + " masterFlux[1][il] " + logE * masterFlux[1][il]);
            //// Teff test - Also needed for convection module!:
            if (il > 1) {
                lambda2 = masterLams[il]; // * 1.0E-7;  // convert nm to cm
                lambda1 = masterLams[il - 1]; // * 1.0E-7;  // convert nm to cm
                fluxSurfBol = fluxSurfBol
                        + masterFluxLam[0] * (lambda2 - lambda1);
            }
        } //il loop
        var sigma = 5.670373E-5; //Stefan-Boltzmann constant ergs/s/cm^2/K^4  
        var logSigma = Math.log(sigma);
        logFluxSurfBol = Math.log(fluxSurfBol);
        var logTeffFlux = (logFluxSurfBol - logSigma) / 4.0;
        var teffFlux = Math.exp(logTeffFlux);
        ////Teff test
        //console.log("FLUX: Recovered Teff = " + teffFlux);
        //Compute JOhnson-Cousins photometric color indices:
        // Disk integrated Flux

        colors = UBVRI(masterLams, masterFlux, numDeps, tauRos, temp);
    } // ifLineOnly condition

    // intensity annuli - for disk rendering:


    // Try HTML session storage object to save the solar and stellar structure.  Stored values must be stringified.

    // Store the target solar structure:
    //console.log("typeof(Storage) " + typeof (Storage));
    if (typeof (Storage) !== "undefined") {
        //Generate the keys - we need one for every single scalar data value
        // and stringify and store the corresponding array element:
        //Store logarithmic values - we can reconstruct lienar values
        var storeValue, storeName;
        for (var i = 0; i < numDeps; i++) {
            //console.log(keyTemp[i]);
            storeName = "tempSun" + String(i);
            storeValue = String(tempSun[1][i]);
            window.sessionStorage.setItem(storeName, storeValue);
            storeName = "kappSun" + String(i);
            storeValue = String(kappaSun[1][i]);
            sessionStorage.setItem(storeName, storeValue);
            // store Sun's gas pressure only - Don't need Sun's radiation pressure??
            storeName = "pressSun" + String(i);
            storeValue = String(pressSun[1][i]);
            sessionStorage.setItem(storeName, storeValue);
            storeName = "rhoSun" + String(i);
            storeValue = String(rhoSun[1][i]);
            sessionStorage.setItem(storeName, storeValue);
            storeName = "mmwSun" + String(i);
            storeValue = String(mmwSun[i]);
            sessionStorage.setItem(storeName, storeValue);
            storeName = "NeSun" + String(i);
            storeValue = String(NeSun[1][i]);
            sessionStorage.setItem(storeName, storeValue);
        }

        for (var i = 0; i < numDeps; i++) {
            //console.log(keyTemp[i]);
            storeName = "tempVega" + String(i);
            storeValue = String(tempVega[1][i]);
            window.sessionStorage.setItem(storeName, storeValue);
            storeName = "kappVega" + String(i);
            storeValue = String(kappaVega[1][i]);
            sessionStorage.setItem(storeName, storeValue);
            // store Sun's gas pressure only - Don't need Sun's radiation pressure??
            storeName = "pressVega" + String(i);
            storeValue = String(pressVega[1][i]);
            sessionStorage.setItem(storeName, storeValue);
            storeName = "rhoVega" + String(i);
            storeValue = String(rhoVega[1][i]);
            sessionStorage.setItem(storeName, storeValue);
            storeName = "mmwVega" + String(i);
            storeValue = String(mmwVega[i]);
            sessionStorage.setItem(storeName, storeValue);
            storeName = "NeVega" + String(i);
            storeValue = String(NeVega[1][i]);
            sessionStorage.setItem(storeName, storeValue);
        }

        // Store the target stellar structure:

        //Generate the keys - we need one for every single scalar data value
        // and stringify and store the corresponding array element:
        //Store logarithmic values - we can reconstruct lienar values

        for (var i = 0; i < numDeps; i++) {
            //console.log(keyTemp[i]);
            storeName = "temp" + String(i);
            storeValue = String(temp[1][i]);
            sessionStorage.setItem(storeName, storeValue);
            storeName = "kapp" + String(i);
            storeValue = String(kappa[1][i]);
            sessionStorage.setItem(storeName, storeValue);
            //Gas pressure
            storeName = "press" + String(i);
            storeValue = String(press[1][i]);
            sessionStorage.setItem(storeName, storeValue);
            //Radiation pressure
            storeName = "pRad" + String(i);
            storeValue = String(press[3][i]);
            sessionStorage.setItem(storeName, storeValue);
            storeName = "rho" + String(i);
            storeValue = String(rho[1][i]);
            sessionStorage.setItem(storeName, storeValue);
            storeName = "mmw" + String(i);
            storeValue = String(mmw[i]);
            sessionStorage.setItem(storeName, storeValue);
            storeName = "Ne" + String(i);
            storeValue = String(Ne[1][i]);
            sessionStorage.setItem(storeName, storeValue);
        }

        // Store the target SED intensity and flux distributions and colors:

        //Generate the keys - we need one for every single scalar data value
        // and stringify and store the corresponding array element:

        for (var il = 0; il < numMaster; il++) {
            //console.log(keyTemp[i]);
            storeName = "lambda" + String(il);
            storeValue = String(masterLams[il]);
            sessionStorage.setItem(storeName, storeValue);
            storeName = "fLambda" + String(il);
            storeValue = String(masterFlux[1][il]);
            sessionStorage.setItem(storeName, storeValue);
            for (var it = 0; it < numThetas; it++) {
                storeName = "iLambda" + String(il) + "_" + String(it);
                storeValue = String(Math.log(masterIntens[il][it]));
                sessionStorage.setItem(storeName, storeValue);
            }
        }

        sessionStorage.setItem("UxmBx", colors[0]);
        sessionStorage.setItem("BmV", colors[1]);
        sessionStorage.setItem("VmR", colors[2]);
        sessionStorage.setItem("VmI", colors[3]);
        sessionStorage.setItem("RmI", colors[4]);
        // Store the target stellar parameters:

        //Generate the keys - we need one for every single scalar data value
        // and stringify and store the corresponding array element:

        storeName = "teff";
        storeValue = String(teff);
        sessionStorage.setItem(storeName, storeValue);
        storeName = "logg";
        storeValue = String(logg);
        sessionStorage.setItem(storeName, storeValue);
        storeName = "kappaScale";
        storeValue = String(kappaScale);
        sessionStorage.setItem(storeName, storeValue);
        storeName = "massStar";
        storeValue = String(massStar);
        sessionStorage.setItem(storeName, storeValue);
    } else {
        //
        //console.log("No Web Storage support.  Everything will take longer...");
        //
    }


//
//
//
// *****************************
// 
//
    // Line profile section:
//
//
//
//


    // Set up grid of line lambda points sampling entire profile (cm):
    var numCore = 5; //per wing
    var numWing = 15; // half-core
    //var numWing = 0;  //debug
    var numPoints = 2 * (numCore + numWing) - 1; // + 1;  //Extra wavelength point at end for monochromatic continuum tau scale
    //linePoints: Row 0 in cm (will need to be in nm for Plack.planck), Row 1 in Doppler widths
    var linePoints = lineGrid(lam0, mass, xiT, numDeps, teff, numCore, numWing,
            logGammaCol, tauRos, temp, press, tempSun, pressSun); //cm
    ////
    //Compute area-normalized depth-independent line profile "phi_lambda(lambda)"
    if (ifVoigt === true) {
        //console.log("voigt2 called");
        var lineProf = voigt2(linePoints, lam0, logGammaCol,
                numDeps, teff, tauRos, temp, press, tempSun, pressSun);
    } else {
        //console.log("voigt called");
        var lineProf = voigt(linePoints, lam0, logGammaCol,
                numDeps, teff, tauRos, temp, press, tempSun, pressSun);
    }

//
// Level population now computed in LevelPops.levelPops()

//
//var logNums = levelPops(lam0, logN, Ne, ionized, chiI, chiL, linePoints, lineProf,
//        numDeps, kappaScale, tauRos, temp, rho);
    var logNums = levelPops(lam0, logN, Ne, ionized, chiI1, chiI2, chiL, gw1, gw2, gwL,
            numDeps, kappaScale, tauRos, temp, rho);
    //
    //Compute depth-dependent logarithmic monochromatic extinction co-efficient, kappa_lambda(lambda, tauRos):
    //Handing in rhoSun instead of rho here is a *weird* fake to get line broadening to scale with logg 
    //approximately okay for saturated lines:   There's something wrong!              
    var logKappaL = lineKap(lam0, logNums, logF, linePoints, lineProf,
            numDeps, kappaScale, tauRos, temp, rhoSun);
    var logTotKappa = lineTotalKap(linePoints, logKappaL, numDeps, kappaScale, kappa);
    //
    //Compute monochromatic optical depth scale, Tau_lambda throughout line profile
    //CAUTION: Returns numPoints+1 x numDeps array: the numPoints+1st row holds the line centre continuum tau scale
    // Method 1: double logTauL[][] = LineTau.tauLambda(numDeps, lineProf, logKappaL,
    // Method 1:        kappa, tauRos, rho, depths);
    // Method 2:
    //var logTauL = tauLambda(numDeps, linePoints, logKappaL,
    //        kappa, tauRos, rhoSun);
    var logTauL = tauLambda(numDeps, numPoints, logTotKappa,
            kappa, tauRos);
    //Evaluate formal solution of rad trans eq at each lambda throughout line profile
    // Initial set to put lambda and tau arrays into form that formalsoln expects
    //var numPoints = linePoints[0].length + 1; //Extra wavelength point at end for monochromatic continuum tau scale

    var lineLambdas = [];
    lineLambdas.length = numPoints;
    //Can't avoid Array constructor here:
    var lineIntens = new Array(numPoints);
    for (var row = 0; row < numPoints; row++) {
        lineIntens[row] = new Array(numThetas);
    }

    var lineIntensLam = [];
    lineIntensLam.length = numThetas;
    var lineFlux = [];
    lineFlux.length = 2;
    lineFlux[0] = [];
    lineFlux[0].length = numPoints;
    lineFlux[1] = [];
    lineFlux[1].length = numPoints;
    var lineFluxLam = [];
    lineFluxLam.length = 2;
    if (ifScatt === true) {
        lineMode = true;
    } else {
        lineMode = false;
    }
    for (var il = 0; il < numPoints; il++) {


//if (il ==== numPoints - 1) {
//    lineLambdas[il] = lam0; // Extra row for line centre continuum taus scale
//} else {
//lineLambdas[il] = (1.0E7 * linePoints[0][il]) + lam0; //convert back to nm
        lineLambdas[il] = linePoints[0][il] + lam0;
        //}

        for (var id = 0; id < numDeps; id++) {
            thisTau[1][id] = logTauL[il][id];
            thisTau[0][id] = Math.exp(logTauL[il][id]);
        } // id loop

        lineIntensLam = formalSoln(numDeps,
                cosTheta, lineLambdas[il], thisTau, temp, lineMode);
        lineFluxLam = flux2(lineIntensLam, cosTheta);
        for (var it = 0; it < numThetas; it++) {
            lineIntens[il][it] = lineIntensLam[it];
        } //it loop - thetas

        lineFlux[0][il] = lineFluxLam[0];
        lineFlux[1][il] = lineFluxLam[1];
    } //il loop

//Continuum flux at line centre for Eq width calculation:
//var ilLam0 = lamPoint(numLams, lambdaScale, lam0);
// Solve formal sol of rad trans eq for outgoing surfaace I(0, theta)

//var intensCont = [];
//intensCont.length = numThetas;
//var fluxCont = [];
//fluxCont.length = 2;
//double[][] intens = new double[numLams][numThetas];
//double[][] flux = new double[2][numLams];
//  double[][] intens = new double[3][numThetas];
//double[][] flux = new double[2][3];
//double lambda1, lambda2, fluxSurfBol, logFluxSurfBol;
//fluxSurfBol = 0;
    //lineMode = false;
    //for (int il = ilLam0-1; il <= ilLam0+1; il++) {
    //System.out.println("il " + il + " lambdaScale[il] " + lambdaScale[il]);
    //intensCont = formalSoln(numDeps,
    //         cosTheta, lambdaScale[ilLam0], tauRos, temp, lineMode);
    //fluxCont = flux2(intensCont, cosTheta);
//Get equivalent width, W_lambda, in pm - picometers:
    var Wlambda = eqWidth(lineFlux, linePoints, lam0); //, fluxCont);
//
//
//
//
    // if JQuery-UI round sliders not available:  
    // displayAll();

// *********************



// Text output section:

//    
// Set up the canvas:
//

    // **********  Basic canvas parameters: These are numbers in px - needed for calculations:
    // All plots and other output must fit within this region to be white-washed between runs

    var xRangeT = 1550;
    var yRangeT = 65;
    var xOffsetT = 10;
    var yOffsetT = 10;
    var charToPxT = 4; // width of typical character font in pixels - CAUTION: finesse!

    var zeroInt = 0;
    //these are the corresponding strings ready to be assigned to HTML style attributes


    var xRangeTStr = numToPxStrng(xRangeT);
    var yRangeTStr = numToPxStrng(yRangeT);
    var xOffsetTStr = numToPxStrng(xOffsetT);
    var yOffsetTStr = numToPxStrng(yOffsetT);
    // Very first thing on each load: White-wash the canvas!!

    var washTId = document.createElement("div");
    var washTWidth = xRangeT + xOffsetT;
    var washTHeight = yRangeT + yOffsetT;
    var washTTop = yOffsetT;
    var washTWidthStr = numToPxStrng(washTWidth);
    var washTHeightStr = numToPxStrng(washTHeight);
    var washTTopStr = numToPxStrng(washTTop);
    washTId.id = "washT";
    washTId.style.position = "absolute";
    washTId.style.width = washTWidthStr;
    washTId.style.height = washTHeightStr;
    washTId.style.marginTop = washTTopStr;
    washTId.style.marginLeft = "0px";
    washTId.style.opacity = 1.0;
    washTId.style.backgroundColor = "#EEEEEE";
    //washId.style.zIndex = -1;
    washTId.style.zIndex = 0;
    //washTId.style.border = "2px blue solid";

    //Wash the canvas:
    textId.appendChild(washTId);
    var roundNum, remain;
    // R & L_Bol:
    var colr = 0;
    var xTab = 60;
    roundNum = radius.toPrecision(3);
    txtPrint("<span title='Stellar radius'><em>R</em> = </span> "
            + roundNum
            + " <span title='Solar radii'>\n\
<a href='http://en.wikipedia.org/wiki/Solar_radius' target='_blank'><em>R</em><sub>Sun</sub></a>\n\
</span> ",
            20 + colr * xTab, 15, zeroInt, zeroInt, zeroInt, textId);
    roundNum = bolLum.toPrecision(3);
    txtPrint("<span title='Bolometric luminosity'>\n\
<a href='http://en.wikipedia.org/wiki/Luminosity' target='_blank'><em>L</em><sub>Bol</sub></a> = \n\
</span> "
            + roundNum
            + " <span title='Solar luminosities'>\n\
<a href='http://en.wikipedia.org/wiki/Solar_luminosity' target='_blank'><em>L</em><sub>Sun</sub></a>\n\
</span> ",
            20 + colr * xTab, 40, zeroInt, zeroInt, zeroInt, textId);
// 
// Equivalent width:
    roundNum = Wlambda.toFixed(2);
    txtPrint("<span title='Equivalent width: A measure of spectral line strength'>\n\
Spectral line \n\
<a href='http://en.wikipedia.org/wiki/Equivalent_width' target='_blank'>W<sub><em>&#955</em></sub></a>: \n\
</span>"
            + roundNum
            + " <span title='picometers'>\n\
<a href='http://en.wikipedia.org/wiki/Picometre' target='_blank'>pm</a>\n\
</span>",
            180, 40, zeroInt, zeroInt, zeroInt, textId);
    ////remain = (Wlambda * 1000.0) % 10;
    ////roundNum = (Wlambda) - (remain / 1000.0);

    //roundNum = Wlambda.toFixed(2);
    //numPrint(roundNum, 330, 40, zeroInt, zeroInt, zeroInt, textId); //debug
    //txtPrint("<span title='picometers'><a href='http://en.wikipedia.org/wiki/Picometre' target='_blank'>pm</a></span>", 370, 40, zeroInt, zeroInt, zeroInt, textId);

    // UBVRI indices
    var xTab = 80;
    var colr = 0;
    var roundNum0 = colors[0].toFixed(2);
    var roundNum1 = colors[1].toFixed(2);
    var roundNum2 = colors[2].toFixed(2);
    var roundNum3 = colors[3].toFixed(2);
    var roundNum4 = colors[4].toFixed(2);
    txtPrint("<a href='http://en.wikipedia.org/wiki/UBV_photometric_system' title='Johnson-Cousins U-B photometric color index' target='_blank'>\n\
<span style='color:purple'>U</span>-" +
            "<span style='color:blue'>B\n\
</span>\n\
</a>: " + roundNum0
            + " <a href='http://en.wikipedia.org/wiki/UBV_photometric_system' title='Johnson-Cousins B-V photometric color index' target='_blank'>\n\
<span style='color:blue'>B\n\
</span>-" +
            "<span style='color:#00FF88'>V</span></a>: " + roundNum1
            + " <a href='http://en.wikipedia.org/wiki/UBV_photometric_system' title='Johnson-Cousins V-R photometric color index' target='_blank'>\n\
<span style='color:#00FF88'>V\n\
</span>-" +
            "<span style='color:red'>R\n\
</span>\n\
</a>: " + roundNum2
            + " <a href='http://en.wikipedia.org/wiki/UBV_photometric_system' title='Johnson-Cousins V-I photometric color index' target='_blank'>\n\
<span style='color:#00FF88'>V\n\
</span>-" +
            "<span style='color:red'>I\n\
</span>\n\
</a>: " + roundNum3
            + " <a href='http://en.wikipedia.org/wiki/UBV_photometric_system' title='Johnson-Cousins R-I photometric color index' target='_blank'>\n\
<span style='color:red'>R</span>-" +
            "<span style='color:brown'>I\n\
</span>\n\
</a>: " + roundNum4, 180 + colr * xTab, 15, zeroInt, zeroInt, zeroInt, textId);
    // Echo back the *actual* input parameters:
    var warning = "";
    if (teff < 6000) {
        //warning = "<span style='color:red'><em>T</em><sub>eff</sub> < 6000 K <br />Cool star mode";
        warning = "<span style='color:red'>Cool star mode</span>";
        txtPrint(warning, 600, 10, zeroInt, zeroInt, zeroInt, textId);
    } else {
        //warning = "<span style='color:blue'><em>T</em><sub>eff</sub> > 6000 K <br />Hot star mode</span>";
        warning = "<span style='color:blue'>Hot star mode</span>";
        txtPrint(warning, 600, 10, zeroInt, zeroInt, zeroInt, textId);
    }

    var spectralClass = " ";
    var luminClass = "V";
    if (teff < 3000.0) {
        spectralClass = "L";
    } else if ((teff >= 3000.0) && (teff < 3900.0)) {
        spectralClass = "M";
    } else if ((teff >= 3900.0) && (teff < 5200.0)) {
        spectralClass = "K";
    } else if ((teff >= 5200.0) && (teff < 5950.0)) {
        spectralClass = "G";
    } else if ((teff >= 5950.0) && (teff < 7300.0)) {
        spectralClass = "F";
    } else if ((teff >= 7300.0) && (teff < 9800.0)) {
        spectralClass = "A";
    } else if ((teff >= 9800.0) && (teff < 30000.0)) {
        spectralClass = "B";
    } else if (teff >= 30000.0) {
        spectralClass = "O";
    }

    if ((logg >= 1.0) && (logg < 1.5)) {
        luminClass = "II";
    } else if ((logg >= 1.5) && (logg < 3.0)) {
        luminClass = "III";
    } else if ((logg >= 3.0) && (logg < 4.0)) {
        luminClass = "IV";
    } else if ((logg >= 4.0) && (logg < 5.0)) {
        luminClass = "V";
    } else if (logg >= 5.0) {
        luminClass = "VI";
    }

    var spectralType = "<a href='https://en.wikipedia.org/wiki/Stellar_classification' title='MK Spectral type' target='_blank'>" +
            spectralClass + " " + luminClass +
            "</a>";
    txtPrint(spectralType, 600, 40, zeroInt, zeroInt, zeroInt, textId);
    xTab = 140;
    var outString, fullNum, j;
    //var numReportable = numInputs - numPreStars - numPreLines - -numPrePlanets - numPerfModes - 1;
    var echoText = "<table><tr>  ";
    //  var setName = ""; //initialization

    for (var i = 0; i < numInputs - 1; i++) {

        var fullNum = settingsId[i].value;
        //roundNum = fullNum.toPrecision(2);
        roundNum = fullNum;
        //console.log("i " + i + " settingsId[i].name " + settingsId[i].name + " settingsId[i].value " + settingsId[i].value + " fullNum " + fullNum + " roundNum " + roundNum);
        if (flagArr[i]) {
            outString = "<td>   <span style='color:red'>   " + settingsId[i].name + "</br>" + roundNum.toString(10) + "   </span>   </td>";
            //outString = "<td>   <span style='color:red'>   " + setName + "</br>" + roundNum.toString(10) + "   </span>   </td>";
        } else {
            outString = "<td>   <span style='color:black'>   " + settingsId[i].name + "</br>" + roundNum.toString(10) + "   </span>   </td>";
            //outString = "<td>   <span style='color:black'>   " + setName + "</br>" + roundNum.toString(10) + "   </span>   </td>";
        }
        //if (i === numReportable / 2){
        //    echoText = echoText + "</tr><tr>";  // New row
        //};
        echoText = echoText + "   " + outString + "   ";
    }  // i loop

    echoText = echoText + "  </tr></table>";
    txtPrint(echoText, 750, 10, zeroInt, zeroInt, zeroInt, textId);
// Graphical output section:


//  NOTE!!!
//  
//  The remaining 3000+ lines of code or so are all devoted to the graphical output plots.  
//  Have not been able to spin this stuff off into separare function that can be called from 
//  seperate source files by the HTML code.  This is baaaaad!  :-(
//    
// Each of these plots takes ~400 lines of code to convert JavaScript calculations into 
// HTML elements!!
// I'd like to spin each plot into a separate function in its own *.js source file, but it doesn't 
// seem to work - !!???

// ***** WARNING: Do NOT rearrange order of plot-wise code-blocks.  Some blocks use variables declared and initialized in
// previous blocks.  If you want to re-arrange the plots in the WWW page, change the row and column number
// indices (plotRow, plotCol) at the beginning of each block

    var colorTemp = function(temp, minTeff, maxTeff, dark) {

        // Converts a gas temperature in K to a approximate rendering RGB color according
        // to the Wien displacement law of blackbody radiation

        var wien = 2.8977721E-1; // Wien's displacement law constant in cm K
        var logMaxPeak = Math.log(wien / minTeff);
        var logMinPeak = Math.log(wien / maxTeff);
        //var greenTeff = 6000.; // K
        var tempSun = 6000;
        //var logGreenPeak = Math.log(wien / greenTeff);
//
        //var logLamPeak = Math.log(wien / temp); // lambda in cm
        var tempVega = 9550.0;
        // Color palate - try keeping the amoung of green neutral and varying the red and blue inversely with Teff
// For hex RRGGBB format there are 16^2 = 256 different values for each of R, G, and B:
// compute how much red and blue should be in the render colour:
// Do not usef full range - buffer by 10 at either end to avoid near- black and white values - ??

        //var gg = 0.0;
        var rr, gg, bb;
        // Red side of green peak
        // if (logLamPeak >= logGreenPeak) {
        //   gg = 0.5 * Math.pow(16, 2) * (logMaxPeak - logLamPeak) / (logMaxPeak - logGreenPeak);
        //    // blue side of green peak
        // } else {
        //    gg = 0.5 * Math.pow(16, 2) * (logLamPeak - logMinPeak) / (logGreenPeak - logMinPeak);
        // }
        if (temp <= tempSun) {
            rr = 255.0;
            gg = 255.0 * (1.0 - (tempSun - temp) / (tempSun - minTeff));
            bb = 255.0 * (1.0 - (tempVega - temp) / (tempVega - minTeff));
        } else if (temp <= tempVega && temp >= tempSun) {
            rr = 255.0;
            gg = 255.0;
            bb = 255.0 * (1.0 - (tempVega - temp) / (tempVega - minTeff));
        } else {
            rr = 255.0 * (1.0 - (temp - tempVega) / (maxTeff - tempVega));
            gg = 255.0 * (1.0 - (temp - tempVega) / (maxTeff - tempVega));
            bb = 255.0;
        }

        var ggI = Math.ceil(dark * gg);
////var tempDisk2 = teff;
// The higher the Teff, the more blue... :
//        //var bb = Math.pow(16, 2) * (logTen(tempDisk2) - logTen(minTeff)) / (logTen(maxTeff) - logTen(minTeff));  // logarithmically 
        //       //var bb = Math.pow(16, 2) - Math.pow(16, 2) * (logLamPeak - logMinPeak) / (logMaxPeak - logMinPeak); 
        //       var bb = Math.pow(16, 2) * (logMaxPeak - logLamPeak) / (logMaxPeak - logMinPeak);
////    var bb = Math.pow(16,2) * ( msTeffs[k] - minTeff )/( maxTeff - minTeff );  // linearly
        var bbI = Math.floor(dark * bb); //MUST convert to integer

//// ... and the less red:
        //       //var rr = Math.pow(16, 2) - Math.pow(16, 2) * (logTen(tempDisk2) - logTen(minTeff)) / (logTen(maxTeff) - logTen(minTeff)); //logarithmically       
        //       var rr = Math.pow(16, 2) * Math.pow((logLamPeak - logMinPeak) / (logMaxPeak - logMinPeak), 2);
////    var rr =  Math.pow(16,2) - Math.pow(16,2) * ( msTeffs[k] - minTeff )/( maxTeff - minTeff ); //linearly
        var rrI = Math.floor(dark * rr); //MUST convert to integer

        //var starRGBHex = "rgb(" + rrI + "," + ggI + "," + bbI + ")";
        //return starRGBHex;

        var RGBArr = [rrI, ggI, bbI];
        return RGBArr;
    };
//    
// Set up the canvas:
//

// **********  Basic canvas parameters: These are numbers in px - needed for calculations:
// All plots and other output must fit within this region to be white-washed between runs

    /*
     var xRange = 1850;
     var yRange = 600;
     */
    var xOffset = 10;
    var yOffset = 20 + yRangeT + yOffsetT;
    var charToPx = 4; // width of typical character font in pixels - CAUTION: finesse!


    var xRange = 300;
    var yRange = 200;
    //var xOffset = 10;
    //var yOffset = 20;

    //these are the corresponding strings ready to be assigned to HTML style attributes


    var xRangeStr = numToPxStrng(xRange);
    var yRangeStr = numToPxStrng(yRange);
    var xOffsetStr = numToPxStrng(xOffset);
    var yOffsetStr = numToPxStrng(yOffset);
    //******* tick mark, label, and axis name properties: 

    var wColor = "#F0F0F0";
    var washer = function(xOffset, yOffset, wColor, areaId) {
        // Very first thing on each load: White-wash the canvas!!


        var washXMargin = 150;
        var washYMargin = 110;
        var washWidth = xRange + washXMargin; //+ xOffset;
        var washHeight = yRange + washYMargin; //+ yOffset;
        var washTop = yOffset - washYMargin / 2 - 16;
        var washLeft = xOffset - washXMargin / 2 - 50;
        var washWidthStr = numToPxStrng(washWidth);
        var washHeightStr = numToPxStrng(washHeight);
        var washTopStr = numToPxStrng(washTop);
        var washLeftStr = numToPxStrng(washLeft);
        var washId = document.createElement("div");
        washId.id = "wash";
        washId.style.position = "absolute";
        washId.style.width = washWidthStr;
        washId.style.height = washHeightStr;
        washId.style.marginTop = washTopStr;
        //washId.style.marginLeft = "0px";
        washId.style.marginLeft = washLeftStr;
        washId.style.opacity = 1.0;
        //washId.style.backgroundColor = "#EEEEEE";
        washId.style.backgroundColor = wColor;
        //washId.style.zIndex = -1;
        washId.style.zIndex = 0;
        //washId.style.border = "1px gray solid";

        //Wash the canvas:
        //masterId.appendChild(washId);
        areaId.appendChild(washId);
    };
    // Line center, lambda_0 

    var keyLambds = halfPower(numPoints, lineFlux);
    var numDeps = tauRos[0].length;
    var xOffsetStr = numToPxStrng(xOffset);
    var yOffsetStr = numToPxStrng(yOffset);
    // ******Individual plot size parameters:


    var charToPx = 4; // width of typical character font in pixels - CAUTION: finesse!
    //
    //Initialize quantities needed for various plots - plots are now all in if(){} blocks
    // so all this now has to be initialized ahead of time:
    // Will need this in some if blocks below:
    var iLamMinMax = minMax2(masterFlux);
    var iLamMax = iLamMinMax[1];
    var norm = 1.0e15; // y-axis normalization
    var wien = 2.8977721E-1; // Wien's displacement law constant in cm K
    var lamMax = 1.0e7 * (wien / teff);
    lamMax = lamMax.toPrecision(5);
    var lamMaxStr = lamMax.toString(10);
    var bandIntens = iColors(masterLams, masterIntens, numThetas, numMaster);
    //Vega's disk center values of B, V, R intensity normalized by B+V+R:
    //var vegaBVR = [1.0, 1.0, 1.0]; //for now
    //console.log("Vega: rr " + vegaBVR[2] +
    //        " gg " + vegaBVR[1] +
    //        " bb " + vegaBVR[0]);
    var rgbVega = [183.0 / 255.0, 160.0 / 255.0, 255.0 / 255.0];
    var bvr = bandIntens[2][0] + bandIntens[3][0] + bandIntens[4][0];
    //console.log("bandIntens[2][0]/bvr " + bandIntens[2][0] / bvr + " bandIntens[3][0]/bvr " + bandIntens[3][0] / bvr + " bandIntens[4][0]/bvr " + bandIntens[4][0] / bvr);
    //console.log("Math.max(bandIntens[2][0]/bvr, bandIntens[3][0]/bvr, bandIntens[4][0]/bvr) " + Math.max(bandIntens[2][0] / bvr, bandIntens[3][0] / bvr, bandIntens[4][0] / bvr));
    var brightScale = 255.0 / Math.max(bandIntens[2][0] / bvr, bandIntens[3][0] / bvr, bandIntens[4][0] / bvr);
    var saveRGB = []; //intialize
    var saveRadius = 0.0; //initialize
    var radiusScale = 20; //solar_radii-to-pixels!
    var logScale = 100; //amplification factor for log pixels
    // 
    // Star radius in pixels:
    //    var radiusPx = (radiusScale * radius);  //linear radius
    var radiusPx = logScale * logTen(radiusScale * radius); //logarithmic radius
    radiusPx = Math.ceil(radiusPx);
    var i = 3;
    var ii = 1.0 * i;
    // LTE Eddington-Barbier limb darkening: I(Tau=0, cos(theta)=t) = B(T(Tau=t))
    var cosFctr = cosTheta[1][i];
    var radiusPxI = Math.ceil(radiusPx * Math.sin(Math.acos(cosFctr)));
    var radiusStr = numToPxStrng(radiusPxI);
    saveRadius = radiusPxI; // For HRD, plot nine
    var i = Math.ceil(numThetas / 2);
    var rrI = Math.ceil(brightScale * (bandIntens[4][i] / bvr) / rgbVega[0]); // / vegaBVR[2]);
    var ggI = Math.ceil(brightScale * (bandIntens[3][i] / bvr) / rgbVega[1]); // / vegaBVR[1]);
    var bbI = Math.ceil(brightScale * (bandIntens[2][i] / bvr) / rgbVega[2]); // / vegaBVR[0]);
    //console.log(" rrI: " + rrI + " ggI: " + ggI + " bbI: " + bbI + " dark: " + dark);
    var RGBArr = [];
    RGBArr.length = 3;
    RGBArr[0] = rrI;
    RGBArr[1] = ggI;
    RGBArr[2] = bbI;
    saveRGB = RGBArr; // For HRD, plot nine


    //******* tick mark, label, and axis name properties: 

    //tick marks:
    var tickHeight = 8;
    var tickHeightStr = numToPxStrng(tickHeight);
    var tickWidth = "0px";
    var tickColor = "black";
    var tickBorder = "1px black solid";
    //labels:
    var labelHeight = 15;
    var labelHeightStr = numToPxStrng(labelHeight);
    var labelWidth = 80;
    var labelWidthStr = numToPxStrng(labelWidth);
    //
    //
    //
    // ********* stabdForm()
    //
    //
    //

    var standForm = function(x) {
        // Turn any old number into the nearest number in standard form with a whole number exponent
        // and a mantissa rounded to the nearest canonical value appropriate for labeling a tick mark 

        var numParts = [2];
        var isNeg = false;
        if (x === 0.0) {
            numParts = [0.0, 0.0];
        } else {

            if (x < 0) {
                isNeg = true;
                x = -1.0 * x;
            }

            var b = logTen(x);
            var n = Math.floor(b);
            var a = x / Math.pow(10.0, n);
            if (isNeg === true) {
                a = -1.0 * a;
            }

            numParts[0] = a; //mantissa
            numParts[1] = n; //exponent
        }

        return numParts;
    };
    //
    //
    //
    // ********* rounder()
    //
    //
    //

    var rounder = function(x, n, flag) {

        // Return a number rounded up or down to n decimal places (sort of?)

        var y, z;
        n = Math.abs(Math.floor(n)); //n was supposed to be a positive whole number anyway
        if (flag != "up" && flag != "down") {
            flag = "down";
        }

        if (n === 0) {
            z = x;
        } else {
            var fctr = Math.pow(10.0, n);
            var fx = 1.0 * x;
            y = fx * fctr;
            if (flag === "up") {
                z = Math.ceil(y);
            } else {
                z = Math.floor(y);
            }

            var fz = 1.0 * z;
            fz = fz / fctr;
        }

        return fz;
    };
    //
    //
    //
    // ********* XBar()
    //
    //
    //
//// Draws a horizontal line (for any purpose) at a given DATA y-coordinate (yVal) 
//and returns the DEVICE y-coordinate (yShift) for further use by calling routine
// (such as placing an accompanying annotation)
//
    var XBar = function(plotRow, plotCol,
            yVal, minYDataIn, maxYDataIn,
            color, areaId) {

        var xOffset = 100 + plotCol * (xRange + 150);
        var yOffset = 100 + yRangeT + yOffsetT + plotRow * (yRange + 120);
        var xOffsetStr = numToPxStrng(xOffset);
        var yOffsetStr = numToPxStrng(yOffset);
        var xLowerYOffset = yOffset + yRange;
        var xLowerYOffsetStr = numToPxStrng(xLowerYOffset);
        //x-axis name properties:

        var yTickXOffset = xOffset - tickHeight / 2; //height and width reversed for y-ticks
        var yTickXOffsetStr = numToPxStrng(yTickXOffset);
        var barWidth = xRange;
        var barWidthStr = numToPxStrng(barWidth);
        var barHeightStr = "1px";
        var yTickPos = yRange * (yVal - minYDataIn) / (maxYDataIn - minYDataIn);
        //       xTickPos = xTickPos;


        var yShift = xLowerYOffset - yTickPos;
//stringify and add unit:
        var yShiftStr = numToPxStrng(yShift);
        //console.log("XBar: yTickPos, yShift, minYDataIn, maxYDataIn, yRange, yVal: "
        //        + yTickPos + " " + yShift + " " + minYDataIn + " " + maxYDataIn + " " + yRange + " " + yVal);

// Make the y-tick mark, Teff:

        var yTickId = document.createElement("div");
        yTickId.class = "ytick";
        yTickId.style.position = "absolute";
        yTickId.style.display = "block";
        yTickId.style.marginLeft = yTickXOffsetStr;
        //yTickId.style.border = tickBorder;
// Note that for y ticks, the height and width are reversed!:
        yTickId.style.width = barWidthStr;
        yTickId.style.height = barHeightStr;
        yTickId.style.zIndex = 0;
        yTickId.style.marginTop = yShiftStr;
        yTickId.style.backgroundColor = color;
//Append the tickmark to the axis element
        //masterId.appendChild(yTickId);
        areaId.appendChild(yTickId);
        return yShift;
    };
    //
    //
    //
    // ********* YBar()
    //
    //
    //

// Draws a vertical line (for any purpose) at a given DATA x-coordinate (xVal) 
//and returns the DEVICE x-coordinate (xShift) for further use by calling routine
// (such as placing an accompanying annotation)
//
    var YBar = function(plotRow, plotCol,
            xVal, minXDataIn, maxXDataIn, barWidth, barHeight,
            yFinesse, color, areaId) {

        var xOffset = 100 + plotCol * (xRange + 150);
        var yOffset = 100 + yRangeT + yOffsetT + plotRow * (yRange + 120) + yFinesse;
        var xOffsetStr = numToPxStrng(xOffset);
        var yOffsetStr = numToPxStrng(yOffset);
        var xLowerYOffset = yOffset + yRange;
        var xLowerYOffsetStr = numToPxStrng(xLowerYOffset);
        var xTickYOffset = xLowerYOffset - tickHeight / 2;
        var xTickYOffsetStr = numToPxStrng(xTickYOffset);
        //var barHeight = yRange;
        var barHeightStr = numToPxStrng(barHeight);
        //var barWidthStr = "1px";
        var barWidthStr = numToPxStrng(barWidth);
        var xTickPos = xRange * (xVal - minXDataIn) / (maxXDataIn - minXDataIn);
        //       xTickPos = xTickPos;
        //console.log("YBar: xVal, minXDataIn, maxXDataIn: " + xVal + " " + minXDataIn + " " + maxXDataIn);

        var xShift = xOffset + xTickPos;
//stringify and add unit:
        var xShiftStr = numToPxStrng(xShift);
        //console.log("YBar: xTickPos, xOffset, xShift, xTickYOffsetStr, barWidthStr, barHeightStr: " +
        //        xTickPos + " " + xOffset + " " + xShift + " " + xTickYOffsetStr + " " + barWidthStr + " " + barHeightStr);

// Make the x-tick mark, Teff:
        //console.log("In YBar: xVal " + xVal + " minXDataIn " + minXDataIn + " maxXDataIn " + maxXDataIn + " xRange " + xRange + " barWidth " + barWidth + " xShift " + xShift);
        //console.log("In YBar: xVal " + xVal + " barWidth " + barWidth + " xShift " + xShift);
        var xTickId = document.createElement("div");
        xTickId.class = "xtick";
        xTickId.style.position = "absolute";
        xTickId.style.display = "block";
        xTickId.style.marginTop = yOffsetStr;
        //xTickId.style.marginTop = xLowerYOffsetStr;
        xTickId.style.marginLeft = xShiftStr;
        xTickId.style.height = barHeightStr;
        xTickId.style.width = barWidthStr;
        //xTickId.style.border = tickBorder;
        xTickId.style.backgroundColor = color;
        xTickId.style.zIndex = 0;
//Append the tickmark to the axis element
        //masterId.appendChild(xTickId);
        areaId.appendChild(xTickId);
        return xShift;
    };
    //
    //console.log("xRange " + xRange + " yRange " + yRange);
    //
    //
    //
    //  ***** XAxis()
    //
    //
    //

    var XAxis = function(plotRow, plotCol,
            minXDataIn, maxXDataIn, xAxisName,
            areaId) {

        var axisParams = [];
        axisParams.length = 8;
        // Variables to handle normalization and rounding:
        var numParts = [];
        numParts.length = 2;
        //var mantissa;
        var xOffset = 100 + plotCol * (xRange + 150);
        var yOffset = 100 + yRangeT + yOffsetT + plotRow * (yRange + 120);
        axisParams[0] = xOffset;
        axisParams[4] = yOffset;
        var xOffsetStr = numToPxStrng(xOffset);
        var yOffsetStr = numToPxStrng(yOffset);
        var xLowerYOffset = yOffset + yRange;
        var xLowerYOffsetStr = numToPxStrng(xLowerYOffset);
        var xTickYOffset = xLowerYOffset - tickHeight / 2;
        var xTickYOffsetStr = numToPxStrng(xTickYOffset);
        var xLabelYOffset = xLowerYOffset + labelHeight;
        var xLabelYOffsetStr = numToPxStrng(xLabelYOffset);
        //x-axis name properties:
        var xNameYOffset = xLowerYOffset + 2 * labelHeight;
        //var xNameYOffsetStr = numToPxStrng(xNameYOffset);
        var xNameXOffset = Math.floor(xRange / 2) + xOffset;
        //var xNameXOffsetStr = numToPxStrng(xNameXOffset);

        axisParams[5] = xLowerYOffset;
        washer(xOffset, yOffset, wColor, areaId);
        //console.log(xOffsetStr);

        var xId = document.createElement("div");
        xId.class = "xaxis";
        xId.style.position = "absolute";
        xId.style.width = xRangeStr;
        xId.style.height = "1px";
        xId.style.marginTop = xLowerYOffsetStr;
        xId.style.marginLeft = xOffsetStr;
        xId.style.border = "1px black solid";
        //Draw the x-axis:
        //masterId.appendChild(xId);
        areaId.appendChild(xId);
        numParts = standForm(minXDataIn);
        //mantissa = rounder(numParts[0], 1, "down");
        //minXData = mantissa * Math.pow(10.0, numParts[1]);
        var mantissa0 = numParts[0];
        var exp0 = numParts[1];
        //numParts = standForm(maxXDataIn);
        //mantissa = rounder(numParts[0], 1, "up");
        //maxXData = mantissa * Math.pow(10.0, numParts[1]);
        var mantissa1 = maxXDataIn / Math.pow(10.0, exp0);
        //var rangeXData = maxXData - minXData;
        var reverse = false; //initialization
        var rangeXData = mantissa1 - mantissa0;
        //Catch axes that are supposed to be backwards
        if (rangeXData < 0.0) {
            rangeXData = -1.0 * rangeXData;
            reverse = true;
        }
        var deltaXData = 1.0; //default initialization
        if (rangeXData >= 100000.0) {
            deltaXData = 20000.0;
        } else if ((rangeXData < 100000.0) && (rangeXData >= 20000.0)) {
            deltaXData = 25000.0;
        } else if ((rangeXData < 20000.0) && (rangeXData >= 1000.0)) {
            deltaXData = 5000.0;
        } else if ((rangeXData < 1000.0) && (rangeXData >= 250.0)) {
            deltaXData = 200.0;
        } else if ((rangeXData < 250.0) && (rangeXData >= 100.0)) {
            deltaXData = 20.0;
        } else if ((rangeXData < 100.0) && (rangeXData >= 50.0)) {
            deltaXData = 10.0;
        } else if ((rangeXData < 50.0) && (rangeXData >= 20.0)) {
            deltaXData = 5.0;
        } else if ((rangeXData < 20.0) && (rangeXData >= 8.0)) {
            deltaXData = 2.0;
        } else if ((rangeXData <= 2.0) && (rangeXData > 0.5)) {
            deltaXData = 0.20;
        } else if ((rangeXData <= 0.5) && (rangeXData > 0.1)) {
            deltaXData = 0.1;
        } else if (rangeXData <= 0.1) {
            deltaXData = 0.02;
        }

        //console.log("XAxis: mantissa0 " + mantissa0 + " exp0 " + exp0 + " mantissa1 " + mantissa1 + " rangeXData " + rangeXData + " reverse " + reverse + " deltaXData " + deltaXData);
        var mantissa0new = mantissa0 - (mantissa0 % deltaXData) - deltaXData;
        var mantissa1new = mantissa1 - (mantissa1 % deltaXData) + deltaXData;
        var numXTicks = Math.floor((mantissa1new - mantissa0new) / deltaXData);
        //console.log("numXTicks " + numXTicks + " mantissa0new " + mantissa0new + " mantissa1new " 
        //        + mantissa1new + " deltaXData " + deltaXData);
        if (reverse) {
            deltaXData = -1.0 * deltaXData;
            //minXData2 = minXData2 - deltaXData; //sigh - I dunno.
            numXTicks = (-1 * numXTicks); // + 1; //sigh - I dunno.
        }
        numXTicks++;
        var minXData2, maxXData2, rangeXData2;
        minXData2 = mantissa0new * Math.pow(10.0, exp0);
        maxXData2 = mantissa1new * Math.pow(10.0, exp0);
        rangeXData2 = (mantissa1new - mantissa0new) * Math.pow(10.0, exp0);
        deltaXData = deltaXData * Math.pow(10.0, exp0);
        //var deltaXData = rangeXData / (1.0 * numXTicks);
        //numParts = standForm(deltaXData);
        //mantissa = rounder(numParts[0], 1, "down");
        //deltaXData = mantissa * Math.pow(10.0, numParts[1]);
        var deltaXPxl = xRange / (numXTicks - 1);
        //console.log("XAxis: mantissa0new " + mantissa0new + " mantissa1new " + mantissa1new + " deltaXData " + deltaXData + " minXData2 " + minXData2 + " maxXData2 " + maxXData2 + " deltaXPxl " + deltaXPxl + " rangeXData2 " + rangeXData2);
        axisParams[1] = rangeXData2;
        axisParams[2] = deltaXData;
        axisParams[3] = deltaXPxl;
        axisParams[6] = minXData2;
        axisParams[7] = maxXData2;
        //
        //console.log("XAxis: xOffset " + xOffset);
        var ii;
        for (var i = 0; i < numXTicks; i++) {

            ii = 1.0 * i;
            var xTickPos = ii * deltaXPxl;
            var xTickVal = minXData2 + (ii * deltaXData);
            var xTickRound = xTickVal.toPrecision(3);
            //var xTickRound = xTickVal;
            var xTickValStr = xTickRound.toString(10);
            // horizontal position in pixels - data values increase rightward:
            var xShift = xOffset + xTickPos;
//stringify and add unit:
            //console.log("XAxis: xTickVal " + xTickVal + " xTickPos " + xTickPos);
            var xShiftStr = numToPxStrng(xShift);
// Make the x-tick mark, Teff:

            var xTickId = document.createElement("div");
            xTickId.class = "xtick";
            xTickId.style.position = "absolute";
            xTickId.style.display = "inline";
            xTickId.style.marginTop = xTickYOffsetStr;
            //xTickId.style.marginTop = xLowerYOffsetStr;
            xTickId.style.marginLeft = xShiftStr;
            xTickId.style.height = tickHeightStr;
            xTickId.style.width = tickWidth;
            xTickId.style.border = tickBorder;
            xTickId.style.zIndex = 0;
//Append the tickmark to the axis element
            //masterId.appendChild(xTickId);
            areaId.appendChild(xTickId);
            //Make the tick label, Teff:

            txtPrint("<span style='font-size:x-small'>" + xTickValStr + "</span>",
                    xShift, xLabelYOffset, zeroInt, zeroInt, zeroInt, areaId);
        }  // end x-tickmark loop


// Add name of x-axis:

        var xNameXOffsetThis = xNameXOffset - charToPx * "Depth (km)".length;
        txtPrint("<span style='font-size:small'>" + xAxisName + "</span>",
                xNameXOffsetThis, xNameYOffset, zeroInt, zeroInt, zeroInt, areaId);
        // console.log("XAxis: " + axisParams[0]);
        return axisParams;
    };
    //
    //
    //
    //  ***** YAxis()
    //
    //
    //

    var YAxis = function(plotRow, plotCol,
            minYDataIn, maxYDataIn, yAxisName,
            areaId) {

        var axisParams = [];
        axisParams.length = 8;
        // Variables to handle normalization and rounding:
        var numParts = [];
        numParts.length = 2;
        //var mantissa;
        var xOffset = 100 + plotCol * (xRange + 150);
        var yOffset = 100 + yRangeT + yOffsetT + plotRow * (yRange + 120);
        axisParams[0] = xOffset;
        axisParams[4] = yOffset;
        var xOffsetStr = numToPxStrng(xOffset);
        var yOffsetStr = numToPxStrng(yOffset);
        var xLowerYOffset = yOffset + yRange;
        var xLowerYOffsetStr = numToPxStrng(xLowerYOffset);
        //x-axis name properties:

        var yTickXOffset = xOffset - tickHeight / 2; //height and width reversed for y-ticks
        var yTickXOffsetStr = numToPxStrng(yTickXOffset);
        var yLabelXOffset = xOffset - 3 * labelHeight; //height & width reversed for y-ticks
        var yLabelXOffsetStr = numToPxStrng(yLabelXOffset);
        var yNameYOffset = yOffset + Math.floor(yRange / 2);
        //var yNameYOffsetStr = numToPxStrng(yNameYOffset);
        var yNameXOffset = xOffset - 100;
        //var yNameXOffsetStr = numToPxStrng(yNameXOffset);

        axisParams[5] = xLowerYOffset;
        // Create the LEFT y-axis element and set its style attributes:

        var yId = document.createElement("div");
        yId.class = "yaxis";
        yId.style.position = "absolute";
        yId.style.width = "1px";
        yId.style.height = yRangeStr;
        yId.style.marginLeft = xOffsetStr;
        yId.style.marginTop = yOffsetStr;
        yId.style.border = "1px black solid";
        //Draw the y-axis:
        //masterId.appendChild(yId);
        areaId.appendChild(yId);
        numParts = standForm(minYDataIn);
        //mantissa = rounder(numParts[0], 1, "down");
        //minYData = mantissa * Math.pow(10.0, numParts[1]);
        var mantissa0 = numParts[0];
        var exp0 = numParts[1];
        //numParts = standForm(maxYDataIn);
        //mantissa = rounder(numParts[0], 1, "up");
        //maxYData = mantissa * Math.pow(10.0, numParts[1]);
        var mantissa1 = maxYDataIn / Math.pow(10.0, exp0);
        //var rangeYData = maxYData - minYData;
        var reverse = false; //initialization
        var rangeYData = mantissa1 - mantissa0;
        //Catch axes that are supposed to be backwards
        if (rangeYData < 0.0) {
            rangeYData = -1.0 * rangeYData;
            reverse = true;
        }
        var deltaYData = 1.0; //default initialization
        if (rangeYData >= 100000.0) {
            deltaYData = 20000.0;
        } else if ((rangeYData < 100000.0) && (rangeYData >= 20000.0)) {
            deltaXData = 25000.0;
        } else if ((rangeYData < 20000.0) && (rangeYData >= 1000.0)) {
            deltaYData = 5000.0;
        } else if ((rangeYData < 1000.0) && (rangeYData >= 250.0)) {
            deltaYData = 200.0;
        } else if ((rangeYData < 250.0) && (rangeYData >= 100.0)) {
            deltaYData = 20.0;
        } else if ((rangeYData < 100.0) && (rangeYData >= 50.0)) {
            deltaYData = 10.0;
        } else if ((rangeYData < 50.0) && (rangeYData >= 20.0)) {
            deltaYData = 5.0;
        } else if ((rangeYData < 20.0) && (rangeYData >= 8.0)) {
            deltaYData = 2.0;
        } else if ((rangeYData <= 2.0) && (rangeYData > 0.5)) {
            deltaYData = 0.20;
        } else if ((rangeYData <= 0.5) && (rangeYData > 0.1)) {
            deltaYData = 0.1;
        } else if (rangeYData <= 0.1) {
            deltaYData = 0.02;
        }

        //console.log("YAxis: mantissa0 " + mantissa0 + " exp0 " + exp0 + " mantissa1 " + mantissa1 + " rangeYData " + rangeYData + " deltaYData " + deltaYData);
        var mantissa0new = mantissa0 - (mantissa0 % deltaYData);
        var mantissa1new = mantissa1 - (mantissa1 % deltaYData) + deltaYData;
        var numYTicks = Math.floor((mantissa1new - mantissa0new) / deltaYData); // + 1;
        if (reverse) {
            deltaYData = -1.0 * deltaYData;
            //minYData2 = minYData2 - deltaXData; //sigh - I dunno.
            numYTicks = (-1 * numYTicks); // + 1; //sigh - I dunno.
        }
        numYTicks++;
        deltaYData = deltaYData * Math.pow(10.0, exp0);
        var minYData2, maxYData2, rangeYData2;
        minYData2 = mantissa0new * Math.pow(10.0, exp0);
        maxYData2 = mantissa1new * Math.pow(10.0, exp0);
        rangeYData2 = (mantissa1new - mantissa0new) * Math.pow(10.0, exp0);
        //console.log("YAxis(): minYData2 " + minYData2 + " maxYData2 " + maxYData2 + " rangeYData2 " + rangeYData2);
        //var deltaYData = rangeYData / (1.0 * numYTicks);
        //numParts = standForm(deltaYData);
        //mantissa = rounder(numParts[0], 1, "down");
        //deltaYData = mantissa * Math.pow(10.0, numParts[1]);
        var deltaYPxl = yRange / (numYTicks - 1);
        //console.log("YAxis: mantissa0new " + mantissa0new + " mantissa1new " + mantissa1new + " deltaYData " + deltaYData + " minYData " + minYData + " maxYData " + maxYData + " deltaYPxl " + deltaYPxl);
        axisParams[1] = rangeYData2;
        axisParams[2] = deltaYData;
        axisParams[3] = deltaYPxl;
        axisParams[6] = minYData2;
        axisParams[7] = maxYData2;
        //
        var ii;
        for (var i = 0; i < numYTicks; i++) {

            ii = 1.0 * i;
            var yTickPos = ii * deltaYPxl;
            // Doesn't work - ?? var yTickVal = minYDataRnd + (ii * deltaDataRnd);
            var yTickVal = minYData2 + (ii * deltaYData);
            var yTickRound = yTickVal.toPrecision(3);
            //console.log("YAxis: yTickRound " + yTickRound + " yTickPos " + yTickPos);
            //var yTickRound = yTickVal;
            var yTickValStr = yTickRound.toString(10);
            // vertical position in pixels - data values increase upward:
            var yShift = xLowerYOffset - yTickPos;
//stringify and add unit:
            var yShiftStr = numToPxStrng(yShift);
// Make the y-tick mark, Teff:

            var yTickId = document.createElement("div");
            yTickId.class = "ytick";
            yTickId.style.position = "absolute";
            yTickId.style.display = "block";
            yTickId.style.marginLeft = yTickXOffsetStr;
            yTickId.style.border = tickBorder;
// Note that for y ticks, the height and width are reversed!:
            yTickId.style.width = tickHeightStr;
            yTickId.style.height = tickWidth;
            yTickId.style.zIndex = 0;
            yTickId.style.marginTop = yShiftStr;
//Append the tickmark to the axis element
            //masterId.appendChild(yTickId);
            areaId.appendChild(yTickId);
            //Make the y-tick label:

            txtPrint("<span style='font-size:x-small'>" + yTickValStr + "</span>",
                    yLabelXOffset, yShift, zeroInt, zeroInt, zeroInt, areaId);
        }  // end y-tickmark loop, j


// Add name of LEFT y-axis:

        txtPrint("<span style='font-size:x-small'>" + yAxisName + "</span>",
                yNameXOffset, yNameYOffset, zeroInt, zeroInt, zeroInt, areaId);
        //console.log("YAxis: " + axisParams[0]);
        return axisParams;
    };
    //   var testVal = -1.26832e7;
    //   var numParts = standForm(testVal);
    //  console.log("mantissa= " + numParts[0] + " exponent= " + numParts[1]);
//
    //   var roundVal = rounder(numParts[0], 1, "up");
    //   console.log("roundVal= " + roundVal);

    var yFinesse = 0.0; //default initialization

    //
//
//  *****   PLOT SEVEN / PLOT 7
//
//

// Plot seven - image of limb-darkened and limb-colored WHITE LIGHT stellar disk

    if (ifLineOnly === false) {
        //console.log("Plot seven");

//    var plotRow = 0;
//    var plotCol = 1;
        var plotRow = 0;
        var plotCol = 0;
        var xOffset = 100 + plotCol * (xRange + 150) + xRange / 2;
        var yOffset = 100 + yRangeT + yOffsetT + plotRow * (yRange + 120);
        var yOffsetStr = numToPxStrng(yOffset);
        var xLowerYOffset = yOffset + yRange / 2;
        var xTickYOffset = xLowerYOffset - tickHeight / 2;
        var xTickYOffsetStr = numToPxStrng(xTickYOffset);
        var xLabelYOffset = xLowerYOffset + labelHeight;
        var xLabelYOffsetStr = numToPxStrng(xLabelYOffset);
        //x-axis name properties:
        var xNameYOffset = xLowerYOffset + 2 * labelHeight;
        var xNameYOffsetStr = numToPxStrng(xNameYOffset);
        var xNameXOffset = Math.floor(xRange / 2) + xOffset;
        var xNameXOffsetStr = numToPxStrng(xNameXOffset);
        var yTickXOffset = xOffset - tickHeight / 2; //height and width reversed for y-ticks
        var yTickXOffsetStr = numToPxStrng(yTickXOffset);
        var yLabelXOffset = xOffset - 3 * labelHeight; //height & width reversed for y-ticks
        var yLabelXOffsetStr = numToPxStrng(yLabelXOffset);
        var yNameYOffset = yOffset + Math.floor(yRange / 2);
        var yNameYOffsetStr = numToPxStrng(yNameYOffset);
        var yNameXOffset = xOffset - 120;
        var yNameXOffsetStr = numToPxStrng(yNameXOffset);
        // Convert solar radii to pixels:

//radius parameters in pixel all done above now:
//        var radiusScale = 20; //solar_radii-to-pixels!
//        var logScale = 100; //amplification factor for log pixels
//        // 
//        // Star radius in pixels:
//        //    var radiusPx = (radiusScale * radius);  //linear radius
//        var radiusPx = logScale * logTen(radiusScale * radius); //logarithmic radius
//        radiusPx = Math.ceil(radiusPx);
        var titleYPos = xLowerYOffset - yRange + 40;
        //var titleXPos = xOffset - xOffset / 2;
        var titleXPos = xOffset;
        var thet1, thet2;
        var thet3;
        washer(xOffset - xRange / 2, yOffset, wColor, plotSevenId);
        // Add title annotation:

        //var titleYPos = xLowerYOffset - 1.15 * yRange;
        //var titleXPos = 1.02 * xOffset;

        txtPrint("<span style='font-size:normal; color:blue'><a href='http://en.wikipedia.org/wiki/Limb_darkening' target='_blank'>White light disk</a></span> <br />\n\
     <span style='font-size:small'>(Logarithmic radius) </span>",
                titleXPos - 100, titleYPos - 15, zeroInt, zeroInt, zeroInt, plotSevenId);
        txtPrint("<span style='font-size:normal; color:black'><em>&#952</em> = </span>",
                titleXPos + 30, titleYPos + 5, zeroInt, zeroInt, zeroInt, plotSevenId);
        //Get the Vega-calibrated colors from the intensity spectrum of each theta annulus:    
        // moved earlier var intcolors = iColors(lambdaScale, intens, numDeps, numThetas, numLams, tauRos, temp);

        //intcolors[0][theta]=Ux-B
        //intcolors[1][theta]=B-V
        //intcolors[2][theta]=V-R
        //intcolors[3][theta]=V-I

        //intcolors[4][theta]=R-I
        //var bvr = bandIntens[2][0] + bandIntens[3][0] + bandIntens[4][0];
        //  Loop over limb darkening sub-disks - largest to smallest
        for (var i = numThetas - 1; i >= 1; i--) {

            ii = 1.0 * i;
            // LTE Eddington-Barbier limb darkening: I(Tau=0, cos(theta)=t) = B(T(Tau=t))
            var cosFctr = cosTheta[1][i];
            var radiusPxI = Math.ceil(radiusPx * Math.sin(Math.acos(cosFctr)));
            var radiusStr = numToPxStrng(radiusPxI);
            //this now done above:
            //           if (i === 3) {
            //               saveRadius = radiusPxI; // For HRD, plot nine
            //           }

// Adjust position to center star:
// Radius is really the *diameter* of the symbol
            var xLowerYOffsetI = xLowerYOffset - radiusPxI / 2;
            var xLowerYOffsetStr = numToPxStrng(xLowerYOffsetI);
            var xOffsetI = xOffset - radiusPxI / 2;
            var xOffsetStr = numToPxStrng(xOffsetI);
            // limb darkening intensity factor:
            // Unnecessary var dark = (intens[iLamMax][i] / intens[iLamMax][0]);

            // Un-necessary
            ////let's make this clear with some helper variables:
            ////We'll try to figure out device RGB colors from BVR photometry (ie. G===V)
            //var bv = intcolors[1][i];
            //var vr = intcolors[2][i];
            //var br = bv + vr;
            //var rb = -1.0 * br;
            //var rv = -1.0 * vr;
            //var vb = -1.0 * bv;
//
            // Assumes I_total = I_B + I_V + I_R:
            //var help = Math.pow(10.0, rb) + Math.pow(10.0, rv) + 1.0; // I_Total/I_R
            //var rrI = Math.ceil(dark * 255.0 / help);
            //var help = Math.pow(10.0, vb) + Math.pow(10.0, vr) + 1.0; // I_Total/I_G
            //var ggI = Math.ceil(dark * 255.0 / help);
            //var help = Math.pow(10.0, bv) + Math.pow(10.0, br) + 1.0; // I_Total/I_B
            //var bbI = Math.ceil(dark * 255.0 / help);
            //  Necessary

            rrI = Math.ceil(brightScale * (bandIntens[4][i] / bvr) / rgbVega[0]); // / vegaBVR[2]);
            ggI = Math.ceil(brightScale * (bandIntens[3][i] / bvr) / rgbVega[1]); // / vegaBVR[1]);
            bbI = Math.ceil(brightScale * (bandIntens[2][i] / bvr) / rgbVega[2]); // / vegaBVR[0]);
            //console.log(" rrI: " + rrI + " ggI: " + ggI + " bbI: " + bbI + " dark: " + dark);

            //var RGBArr = [];
            //RGBArr.length = 3;
            //RGBArr[0] = rrI;
            //RGBArr[1] = ggI;
            //RGBArr[2] = bbI;
//            if (i === Math.ceil(numThetas / 2)) {
//                saveRGB = RGBArr; // For HRD, plot nine
//            }
//console.log("Plot seven: rrI, ggI, bbI: " + rrI + " " + ggI + " " + bbI);
            //console.log("i, rrI, ggI, bbI " + i + " " + rrI + " " + ggI + " " + bbI + " radiusStr " + radiusStr);
            var starRGBHex = "rgb(" + rrI + "," + ggI + "," + bbI + ")";
            var starId = document.createElement("div");
            starId.class = "star";
            starId.style.display = "block";
            starId.style.position = "absolute";
            starId.style.height = radiusStr;
            starId.style.width = radiusStr;
            //   starId.style.border = tickBorder;
            starId.style.borderRadius = "100%";
            //starId.style.zIndex = "-1"; // put on top    
            starId.style.opacity = "1.0";
            starId.style.backgroundColor = starRGBHex;
            starId.style.marginTop = xLowerYOffsetStr;
            starId.style.marginLeft = xOffsetStr;
            //starId.style.border = "1px blue solid";

            plotSevenId.appendChild(starId);
            //
            //Angle indicators
            if ((i % 2) === 0) {
                thet1 = 180.0 * Math.acos(cosTheta[1][i]) / Math.PI;
                thet2 = thet1.toPrecision(2);
                thet3 = thet2.toString(10);
                txtPrint("<span style='font-size:small; background-color:#888888'>" + thet3 + "</span>",
                        titleXPos + (i + 2) * 10, titleYPos + 5, rrI, ggI, bbI, plotSevenId);
            }
//
        }
    }

//
//  *****   PLOT TWELVE / PLOT 12
//
//

// Plot seven - image of limb-darkened and limb-colored TUNABLE MONOCHROMATIC stellar disk

    if (ifLineOnly === false) {
        //console.log("Plot seven");

//    var plotRow = 0;
//    var plotCol = 1;
        var plotRow = 1;
        var plotCol = 0;
        var xOffset = 100 + plotCol * (xRange + 150) + xRange / 2;
        var yOffset = 100 + yRangeT + yOffsetT + plotRow * (yRange + 120);
        var yOffsetStr = numToPxStrng(yOffset);
        var xLowerYOffset = yOffset + yRange / 2;
        var xTickYOffset = xLowerYOffset - tickHeight / 2;
        var xTickYOffsetStr = numToPxStrng(xTickYOffset);
        var xLabelYOffset = xLowerYOffset + labelHeight;
        var xLabelYOffsetStr = numToPxStrng(xLabelYOffset);
        //x-axis name properties:
        var xNameYOffset = xLowerYOffset + 2 * labelHeight;
        var xNameYOffsetStr = numToPxStrng(xNameYOffset);
        var xNameXOffset = Math.floor(xRange / 2) + xOffset;
        var xNameXOffsetStr = numToPxStrng(xNameXOffset);
        var yTickXOffset = xOffset - tickHeight / 2; //height and width reversed for y-ticks
        var yTickXOffsetStr = numToPxStrng(yTickXOffset);
        var yLabelXOffset = xOffset - 3 * labelHeight; //height & width reversed for y-ticks
        var yLabelXOffsetStr = numToPxStrng(yLabelXOffset);
        var yNameYOffset = yOffset + Math.floor(yRange / 2);
        var yNameYOffsetStr = numToPxStrng(yNameYOffset);
        var yNameXOffset = xOffset - 120;
        var yNameXOffsetStr = numToPxStrng(yNameXOffset);
        // Convert solar radii to pixels:

//radius parameters in pixel all done above now:
//        var radiusScale = 20; //solar_radii-to-pixels!
//        var logScale = 100; //amplification factor for log pixels
//        // 
//        // Star radius in pixels:
//        //    var radiusPx = (radiusScale * radius);  //linear radius
//        var radiusPx = logScale * logTen(radiusScale * radius); //logarithmic radius
//        radiusPx = Math.ceil(radiusPx);
        var titleYPos = xLowerYOffset - yRange + 40;
        //var titleXPos = xOffset - xOffset / 2;
        var titleXPos = xOffset;
        var thet1, thet2;
        var thet3;
        washer(xOffset - xRange / 2, yOffset, wColor, plotTwelveId);
        // Add title annotation:

        //var titleYPos = xLowerYOffset - 1.15 * yRange;
        //var titleXPos = 1.02 * xOffset;

        txtPrint("<span style='font-size:normal; color:blue'><a href='http://en.wikipedia.org/wiki/Limb_darkening' target='_blank'>Monochromatic disk</a></span><span style='font-size:small'> &#955 = " + diskLambda + "</span> </br>\n\
     <span style='font-size:small'>(Logarithmic radius) </span>",
                titleXPos - 100, titleYPos - 15, zeroInt, zeroInt, zeroInt, plotTwelveId);
        txtPrint("<span style='font-size:normal; color:black'><em>&#952</em> = </span>",
                titleXPos + 30, titleYPos + 5, zeroInt, zeroInt, zeroInt, plotTwelveId);
        var ilLam0 = lamPoint(numMaster, masterLams, 1.0e-7 * diskLambda);
        var lambdanm = masterLams[ilLam0] * 1.0e7; //cm to nm
        //console.log("PLOT TWELVE: ilLam0=" + ilLam0 + " lambdanm " + lambdanm);
        var minZData = 0.0;
        var maxZData = masterIntens[ilLam0][0] / norm;
        var rangeZData = maxZData - minZData;
        //For lambda --> RGB conversion:
        var Gamma = 0.80;
        var IntensityMax = 255;
        var factor = 1.0;
        var Red, Green, Blue, Wavelength;
        var rgb = [];
        rgb.length = 3;
        //  Loop over limb darkening sub-disks - largest to smallest
        for (var i = numThetas - 1; i >= 1; i--) {

            ii = 1.0 * i;
            // LTE Eddington-Barbier limb darkening: I(Tau=0, cos(theta)=t) = B(T(Tau=t))
            var cosFctr = cosTheta[1][i];
            var radiusPxI = Math.ceil(radiusPx * Math.sin(Math.acos(cosFctr)));
            var radiusStr = numToPxStrng(radiusPxI);
// Adjust position to center star:
// Radius is really the *diameter* of the symbol
            var xLowerYOffsetI = xLowerYOffset - radiusPxI / 2;
            var xLowerYOffsetStr = numToPxStrng(xLowerYOffsetI);
            var xOffsetI = xOffset - radiusPxI / 2;
            var xOffsetStr = numToPxStrng(xOffsetI);
            //logarithmic z:
            //zLevel = (logE * masterIntens[1lLam0][i] - minZData) / rangeZData;
//linear z:


            zLevel = ((masterIntens[ilLam0][i] / norm) - minZData) / rangeZData;
            //console.log("lambdanm " + lambdanm + " zLevel " + zLevel);


// Okay - now the question is:  Which crayon in the box does your optic nerve and visual cortex
//  think corresponds to each wavelength??   This is actually beyond the realm of physics and astrophsyics... 
            // Taken from Earl F. Glynn's web page:
            // <a href="http://www.efg2.com/Lab/ScienceAndEngineering/Spectra.htm">Spectra Lab Report</a>
            // Converted from C to JS by Ian Short, Aug 2015

            Wavelength = lambdanm;
            if ((Wavelength >= 370) && (Wavelength < 440)) {
                Red = -(Wavelength - 440) / (440 - 370);
                Green = 0.0;
                Blue = 1.0;
            } else if ((Wavelength >= 440) && (Wavelength < 490)) {
                Red = 0.0;
                Green = (Wavelength - 440) / (490 - 440);
                Blue = 1.0;
            } else if ((Wavelength >= 490) && (Wavelength < 510)) {
                Red = 0.0;
                Green = 1.0;
                Blue = -(Wavelength - 510) / (510 - 490);
            } else if ((Wavelength >= 510) && (Wavelength < 580)) {
                Red = (Wavelength - 510) / (580 - 510);
                Green = 1.0;
                Blue = 0.0;
            } else if ((Wavelength >= 580) && (Wavelength < 645)) {
                Red = 1.0;
                Green = -(Wavelength - 645) / (645 - 580);
                Blue = 0.0;
            } else if ((Wavelength >= 645) && (Wavelength < 781)) {
                Red = 1.0;
                Green = 0.0;
                Blue = 0.0;
            } else {
                Red = 0.0;
                Green = 0.0;
                Blue = 0.0;
            }

            rgb[0] = Math.floor(IntensityMax * Math.pow(Red * factor, Gamma));
            rgb[1] = Math.floor(IntensityMax * Math.pow(Green * factor, Gamma));
            rgb[2] = Math.floor(IntensityMax * Math.pow(Blue * factor, Gamma));
            //console.log("i " + i + " Wavelength " + Wavelength + " rgb " + rgb[0] + " " + rgb[1] + " " + rgb[2] + " zLevel " + zLevel);
            //Value:
            //r255 = Math.floor(r255 * zLevel);
            //g255 = Math.floor(g255 * zLevel);
            //b255 = Math.floor(b255 * zLevel);
            //test zLevel = 1.0; //test
            r255 = Math.floor(rgb[0] * zLevel);
            g255 = Math.floor(rgb[1] * zLevel);
            b255 = Math.floor(rgb[2] * zLevel);
            //Accomodate wavelenths outside the visible band:
            if (Wavelength < 370.0) {
                r255 = Math.floor(255.0 * zLevel);
                g255 = 0;
                b255 = Math.floor(255.0 * zLevel);
            }
            if (Wavelength >= 781.0) {
                r255 = Math.floor(128.0 * zLevel);
                g255 = Math.floor(0.0 * zLevel);
                b255 = 0;
            }
            var starRGBHex = colHex(r255, g255, b255);
            //rrI = Math.ceil(brightScale * (bandIntens[4][i] / bvr) / rgbVega[0]); // / vegaBVR[2]);
            //ggI = Math.ceil(brightScale * (bandIntens[3][i] / bvr) / rgbVega[1]); // / vegaBVR[1]);
            //bbI = Math.ceil(brightScale * (bandIntens[2][i] / bvr) / rgbVega[2]); // / vegaBVR[0]);
            //console.log(" rrI: " + rrI + " ggI: " + ggI + " bbI: " + bbI + " dark: " + dark);


            //var starRGBHex = "rgb(" + rrI + "," + ggI + "," + bbI + ")";
            var starId = document.createElement("div");
            starId.class = "star";
            starId.style.display = "block";
            starId.style.position = "absolute";
            starId.style.height = radiusStr;
            starId.style.width = radiusStr;
            //   starId.style.border = tickBorder;
            starId.style.borderRadius = "100%";
            //starId.style.zIndex = "-1"; // put on top    
            starId.style.opacity = "1.0";
            starId.style.backgroundColor = starRGBHex;
            starId.style.marginTop = xLowerYOffsetStr;
            starId.style.marginLeft = xOffsetStr;
            //starId.style.border = "1px blue solid";

            plotTwelveId.appendChild(starId);
            //
            //Angle indicators
            if ((i % 2) === 0) {
                thet1 = 180.0 * Math.acos(cosTheta[1][i]) / Math.PI;
                thet2 = thet1.toPrecision(2);
                thet3 = thet2.toString(10);
                txtPrint("<span style='font-size:small; background-color:#888888'>" + thet3 + "</span>",
                        titleXPos + (i + 2) * 10, titleYPos + 5, r255, g255, b255, plotTwelveId);
            }
//
        }
    }

    //
    //
    //  *****   PLOT TEN / PLOT 10
    //
    //
    // Plot Ten: Spectrum image

    if (ifLineOnly === false) {

        //console.log("plot ten");
        //   var plotRow = 3;
        //   var plotCol = 0;
        var plotRow = 0;
        var plotCol = 1;
        yFinesse = 50;
        //var yRangeHere = 100;
        var xOffset = 100 + plotCol * (xRange + 150) + xRange / 2;
        var yOffset = 100 + yRangeT + yOffsetT + plotRow * (yRange + 120);
        var yOffsetStr = numToPxStrng(yOffset);
        var xLowerYOffset = yOffset + yRange / 2;
        var xTickYOffset = xLowerYOffset - tickHeight / 2;
        var xTickYOffsetStr = numToPxStrng(xTickYOffset);
        var xLabelYOffset = xLowerYOffset + labelHeight;
        var xLabelYOffsetStr = numToPxStrng(xLabelYOffset);
        //x-axis name properties:
        var xNameYOffset = xLowerYOffset + 2 * labelHeight;
        var xNameYOffsetStr = numToPxStrng(xNameYOffset);
        var xNameXOffset = Math.floor(xRange / 2) + xOffset;
        var xNameXOffsetStr = numToPxStrng(xNameXOffset);
        var yTickXOffset = xOffset - tickHeight / 2; //height and width reversed for y-ticks
        var yTickXOffsetStr = numToPxStrng(yTickXOffset);
        var yLabelXOffset = xOffset - 3 * labelHeight; //height & width reversed for y-ticks
        var yLabelXOffsetStr = numToPxStrng(yLabelXOffset);
        var yNameYOffset = yOffset + Math.floor(yRange / 2);
        var yNameYOffsetStr = numToPxStrng(yNameYOffset);
        var yNameXOffset = xOffset - 120;
        var yNameXOffsetStr = numToPxStrng(yNameXOffset);
        // var minXData = 1.0e7 * masterLams[0] - 50.;
        // var maxXData = 1.0e7 * masterLams[numMaster - 1] + 100.;
        var minXData = 380.0; // (nm) blue
        //console.log("minXData " + minXData);
        var maxXData = 680.0; // (nm) red
        //var midXData = (minXData + maxXData) / 2.0;  // "green"


        //var xAxisName = "&#955 (nm)";
        var xAxisName = " ";
        //now done above var norm = 1.0e15; // y-axis normalization
        //var minYData = 0.0;
        // iLamMax established in PLOT TWO above:
        //var maxYData = masterFlux[0][iLamMax] / norm;
        // y-axis is just the arbitrary vertical scale - has no data significance
        var minYData = 0.0;
        var maxYData = 1.0;
        //
        //z-axiz (out of the screen) is really intensity level
        //Logarithmic z:
        //var minZData = 12.0;
        //var maxZData = logE * masterFlux[1][iLamMax];
        //Linear z:
        var ilLam0 = lamPoint(numMaster, masterLams, 1.0e-7 * minXData);
        var ilLam1 = lamPoint(numMaster, masterLams, 1.0e-7 * maxXData);
        var minZData = 0.0;
        var maxZData = masterFlux[0][iLamMax] / norm;
        //Make sure spectrum is normalized to brightest displayed lambda haveing level =255
        // even when lambda_Max is outside displayed lambda range:
        if (iLamMax < ilLam0) {
            maxZData = masterFlux[0][ilLam0] / norm;
        }
        if (iLamMax > ilLam1) {
            maxZData = masterFlux[0][ilLam1] / norm;
        }
        var rangeZData = maxZData - minZData;
        //var yAxisName = "<span title='Monochromatic surface flux'><a href='http://en.wikipedia.org/wiki/Spectral_flux_density' target='_blank'>Log<sub>10</sub> <em>F</em><sub>&#955</sub> <br /> ergs s<sup>-1</sup> cm<sup>-3</sup></a></span>";


        var xAxisParams = XAxis(plotRow, plotCol,
                minXData, maxXData, xAxisName,
                plotTenId);
        //console.log("minYData " + minYData + " maxYData " + maxYData);

        // var yAxisParams = YAxis(plotRow, plotCol,
        //        minYData, maxYData, yAxisName,
        //        plotTenId);

        //var zRange = 255.0;  //16-bit each for RGB (48-bit colour??)

        xOffset = xAxisParams[0];
        yOffset = xAxisParams[4];
        //var rangeXData = xAxisParams[1];
        var deltaXData = xAxisParams[2];
        var deltaXPxl = xAxisParams[3];
        //var rangeYData = yAxisParams[1];
        //var deltaYData = yAxisParams[2];
        //var deltaYPxl = yAxisParams[3];
        var xLowerYOffset = xAxisParams[5];
        //minXData = xAxisParams[6];  //updated value
        //minYData = yAxisParams[6];  //updated value

        washer(xOffset, yOffset, wColor, plotTenId);
        // Add legend annotation:
        //var legendYPos = xLowerYOffset - 1.2 * yRangeHere;
        //var legendXPos = 1.05 * xOffset;

        //txtPrint(" ", legendXPos, legendYPos + 10, zeroInt, zeroInt, zeroInt, plotTenId);
        var titleYPos = xLowerYOffset - 1.15 * yRange;
        var titleXPos = 1.02 * xOffset;
        txtPrint("<span style='font-size:normal; color:blue'><a href='https://en.wikipedia.org/wiki/Visible_spectrum' target='_blank'>\n\
     Visual spectrum</a></span>",
                titleXPos, titleYPos - 25, zeroInt, zeroInt, zeroInt, plotTenId);
        var xShift, zShift, xShiftDum, zLevel;
        var RGBHex, r255, g255, b255;
        var rangeXData = 1.0e7 * (masterLams[ilLam1] - masterLams[ilLam0]);
        //console.log("minXData " + minXData + " ilLam0 " + ilLam0 + " masterLams[ilLam0] " + masterLams[ilLam0]);

        var barWidth, xBarShift0, xBarShift1, xPos, yPos, nameLbl, lamLbl, lamLblStr, lamLblNum;
        var barHeight = 75.0;
        //For lambda --> RGB conversion:
        var Gamma = 0.80;
        var IntensityMax = 255;
        var factor = 1.0;
        var Red, Green, Blue, Wavelength;
        var rgb = [];
        rgb.length = 3;
//We can only palce vertical bars by setting marginleft, so search *AHEAD* in wavelength to find width
// of *CURRENT* bar.
        var lambdanm = masterLams[ilLam0] * 1.0e7; //cm to nm
        for (var i = ilLam0 + 1; i < ilLam1; i++) {

            var nextLambdanm = masterLams[i] * 1.0e7; //cm to nm
            //logLambdanm = 7.0 + logTen(masterLams[i]);

            //barWidth = Math.max(1, Math.ceil(xRange * (lambdanm - lastLambdanm) / rangeXData));
            //barWidth = xRange * (nextLambdanm - lambdanm) / rangeXData;
            //Try calculating the barWidth (device coordinates) in *EXACTLY* the same way as YBar calcualtes its x-position:
            xBarShift0 = xRange * (lambdanm - minXData) / (maxXData - minXData);
            xBarShift1 = xRange * (nextLambdanm - minXData) / (maxXData - minXData);
            barWidth = xBarShift1 - xBarShift0; //in device pixels

            if (barWidth > 0.5) {

                barWidth = barWidth + 1.0;
//logarithmic z:
                //zLevel = (logE * masterFlux[1][i] - minZData) / rangeZData;
//linear z:


                zLevel = ((masterFlux[0][i] / norm) - minZData) / rangeZData;
                //console.log("lambdanm " + lambdanm + " zLevel " + zLevel);


// Okay - now the question is:  Which crayon in the box does your optic nerve and visual cortex
//  think corresponds to each wavelength??   This is actually beyond the realm of physics and astrophsyics... 
                // Taken from Earl F. Glynn's web page:
                // <a href="http://www.efg2.com/Lab/ScienceAndEngineering/Spectra.htm">Spectra Lab Report</a>
                // Converted from C to JS by Ian Short, Aug 2015

                Wavelength = lambdanm;
                if ((Wavelength >= 370) && (Wavelength < 440)) {
                    Red = -(Wavelength - 440) / (440 - 370);
                    Green = 0.0;
                    Blue = 1.0;
                } else if ((Wavelength >= 440) && (Wavelength < 490)) {
                    Red = 0.0;
                    Green = (Wavelength - 440) / (490 - 440);
                    Blue = 1.0;
                } else if ((Wavelength >= 490) && (Wavelength < 510)) {
                    Red = 0.0;
                    Green = 1.0;
                    Blue = -(Wavelength - 510) / (510 - 490);
                } else if ((Wavelength >= 510) && (Wavelength < 580)) {
                    Red = (Wavelength - 510) / (580 - 510);
                    Green = 1.0;
                    Blue = 0.0;
                } else if ((Wavelength >= 580) && (Wavelength < 645)) {
                    Red = 1.0;
                    Green = -(Wavelength - 645) / (645 - 580);
                    Blue = 0.0;
                } else if ((Wavelength >= 645) && (Wavelength < 781)) {
                    Red = 1.0;
                    Green = 0.0;
                    Blue = 0.0;
                } else {
                    Red = 0.0;
                    Green = 0.0;
                    Blue = 0.0;
                }


                rgb[0] = Math.floor(IntensityMax * Math.pow(Red * factor, Gamma));
                rgb[1] = Math.floor(IntensityMax * Math.pow(Green * factor, Gamma));
                rgb[2] = Math.floor(IntensityMax * Math.pow(Blue * factor, Gamma));
                //console.log("i " + i + " Wavelength " + Wavelength + " rgb " + rgb[0] + " " + rgb[1] + " " + rgb[2]);

                //Value:
                //r255 = Math.floor(r255 * zLevel);
                //g255 = Math.floor(g255 * zLevel);
                //b255 = Math.floor(b255 * zLevel);
                //test zLevel = 1.0; //test
                r255 = Math.floor(rgb[0] * zLevel);
                g255 = Math.floor(rgb[1] * zLevel);
                b255 = Math.floor(rgb[2] * zLevel);
                RGBHex = colHex(r255, g255, b255);
//console.log("lastLambdanm " + lastLambdanm + " lambdanm " + lambdanm + " (lambdanm - lastLambdanm) " + (lambdanm - lastLambdanm) +
                //       " (lambdanm - lastLambdanm) / rangeXData " + (lambdanm - lastLambdanm) / rangeXData + " xRange * (lambdanm - lastLambdanm) / rangeXData " + xRange * (lambdanm - lastLambdanm) / rangeXData );

                //console.log("rgb[0], rgb[1], rgb[2] " + rgb[0] + " " + rgb[1] + " " + rgb[2]);
                //console.log("r255, g255, b255 " + r255 + " " + g255 + " " + b255);
                //console.log("Before YBar: lambdanm " + lambdanm + " minXData " + minXData + " maxXData " + maxXData + " xRange " + xRange + " barWidth " + barWidth + " RGBHex " + RGBHex);
                xShiftDum = YBar(plotRow, plotCol,
                        lambdanm, minXData, maxXData, barWidth, barHeight,
                        yFinesse, RGBHex, plotTenId);
                //console.log("lambdanm " + lambdanm + " nextLambdanm " + nextLambdanm + " xShiftDum " + xShiftDum + " barWidth " + barWidth);

                lambdanm = nextLambdanm;
            }  //barWidth condition

        }  // i loop (wavelength)

//Spectral line labels and pointers:
        r255 = 0;
        g255 = 0;
        b255 = 0;
        barWidth = 1.0;
        barHeight = 20; //initialize
        RGBHex = "#000000"; //black
        //
        for (var i = 0; i < numLines; i++) {

            if ((i % 4) === 0) {
                yPos = xLabelYOffset - 90;
                barHeight = 20;
            } else if ((i % 4) === 1) {
                yPos = xLabelYOffset + 20;
                barHeight = 20;
            } else if ((i % 4) === 2) {
                yPos = xLabelYOffset - 110;
                barHeight = 50;
            } else {
                yPos = xLabelYOffset + 40;
                barHeight = 50;
            }

            xPos = xRange * (listLam0[i] - minXData) / (maxXData - minXData);
            xPos = xPos - 5; // finesse
            //console.log("xPos " + xPos + " xLabelYOffset " + xLabelYOffset);

            nameLbl = "<span style='font-size: xx-small'>" + listName[i] + "</span>";
            lamLblNum = listLam0[i].toPrecision(4);
            lamLblStr = lamLblNum.toString(10);
            lamLbl = "<span style='font-size: xx-small'>" + lamLblStr + "</span>";
            txtPrint(nameLbl, xPos + xOffset, yPos, r255, g255, b255, plotTenId);
            txtPrint(lamLbl, xPos + xOffset, yPos + 10, r255, g255, b255, plotTenId);
            //xShiftDum = YBar(plotRow, plotCol,
            //        listLam0[i], minXData, maxXData, barWidth, barHeight,
            //        yFinesse, RGBHex, plotTenId);

        }
    }

//
//
//  *****   PLOT ELEVEN / PLOT 11
//
//
// Plot Eleven: Life Zone

    if (ifLineOnly === false) {

//    var plotRow = 3;
//    var plotCol = 1;
        var plotRow = 0;
        var plotCol = 2;
        var xOffset = 100 + plotCol * (xRange + 150) + xRange / 2;
        var yOffset = 100 + yRangeT + yOffsetT + plotRow * (yRange + 120);
        var yOffsetStr = numToPxStrng(yOffset);
        var xLowerYOffset = yOffset + yRange / 2;
        var xTickYOffset = xLowerYOffset - tickHeight / 2;
        var xTickYOffsetStr = numToPxStrng(xTickYOffset);
        var xLabelYOffset = xLowerYOffset + labelHeight;
        var xLabelYOffsetStr = numToPxStrng(xLabelYOffset);
        //x-axis name properties:
        var xNameYOffset = xLowerYOffset + 2 * labelHeight;
        var xNameYOffsetStr = numToPxStrng(xNameYOffset);
        var xNameXOffset = Math.floor(xRange / 2) + xOffset;
        var xNameXOffsetStr = numToPxStrng(xNameXOffset);
        var yTickXOffset = xOffset - tickHeight / 2; //height and width reversed for y-ticks
        var yTickXOffsetStr = numToPxStrng(yTickXOffset);
        var yLabelXOffset = xOffset - 3 * labelHeight; //height & width reversed for y-ticks
        var yLabelXOffsetStr = numToPxStrng(yLabelXOffset);
        var yNameYOffset = yOffset + Math.floor(yRange / 2);
        var yNameYOffsetStr = numToPxStrng(yNameYOffset);
        var yNameXOffset = xOffset - 120;
        var yNameXOffsetStr = numToPxStrng(yNameXOffset);
        // Calculation of steam line and ice line:

        //Assuming liquid salt-free water at one atmospheric pressure is necessary:
        var steamTemp = 373.0; // K = 100 C
        var iceTemp = 273.0; //K = 0 C

        //console.log("greenHouse " + greenHouse + " albedo " + albedo);
        //var albedo = 0.3;  //Same as Earth
        //var greenHouse = 20.0;  //K - boost to surface temeprature from planetary atmospheric greenhosue effect
        steamTemp = steamTemp - greenHouse;
        iceTemp = iceTemp - greenHouse;
        var logSteamLine, logIceLine;
        var au = 1.4960e13; // 1 AU in cm
        var rSun = 6.955e10; // solar radii to cm
        //Steam line:
        //Set steamTemp equal to planetary surface temp and find distance that balances stellar irradiance 
        //absorbed by planetary cross-section with planet's bolometric thermal emission:
        //Everything in solar units -> distance, d, in solar radii
        logSteamLine = 2.0 * (Math.log(teff) - Math.log(steamTemp)) + logRadius + 0.5 * Math.log(1.0 - albedo);
        //now the same for the ice line:
        logIceLine = 2.0 * (Math.log(teff) - Math.log(iceTemp)) + logRadius + 0.5 * Math.log(1.0 - albedo);
        var iceLineAU = Math.exp(logIceLine) * rSun / au;
        var steamLineAU = Math.exp(logSteamLine) * rSun / au;
        iceLineAU = iceLineAU.toPrecision(3);
        steamLineAU = steamLineAU.toPrecision(3);
        //console.log("steamLine " + logE * logSteamLine + " iceLine " + logE * logIceLine);

        // Convert solar radii to pixels:

        var radiusScale = 20; //solar_radii-to-pixels!
        var logScale = 30; //amplification factor for log pixels


        // 
        // Star radius in pixels:

        //    var radiusPx = (radiusScale * radius);  //linear radius
        var radiusPx = logScale * logTen(radiusScale * radius); //logarithmic radius

        radiusPx = Math.ceil(radiusPx);
        var radiusPxSteam = logScale * logTen(radiusScale * radius * Math.exp(logSteamLine));
        radiusPxSteam = Math.ceil(radiusPxSteam);
        var radiusPxIce = logScale * logTen(radiusScale * radius * Math.exp(logIceLine));
        radiusPxIce = Math.ceil(radiusPxIce);
        // Key raii in order of *DECREASING* size (important!):
        var radii = [radiusPxIce + 2, radiusPxIce, radiusPxSteam, radiusPxSteam - 2, radiusPx];
        //
//    j = Math.ceil(numThetas/2); //color near centre:
        //  //let's make this clear with some helper variables:
        //  //We'll try to figure out device RGB colors from BVR photometry (ie. G===V)
        //bv = intcolors[1][j];
        //vr = intcolors[2][j];
        //br = bv + vr;
        //rb = -1.0 * br;
        //rv = -1.0 * vr;
        //vb = -1.0 * bv;
//
        // Assumes I_total = I_B + I_V + I_R:
        //help = Math.pow(10.0, rb) + Math.pow(10.0, rv) + 1.0; // I_Total/I_R
        //var rrI = Math.ceil((255.0 / help));
        //help = Math.pow(10.0, vb) + Math.pow(10.0, vr) + 1.0; // I_Total/I_G
        //var ggI = Math.ceil((255.0 / help));
        //help = Math.pow(10.0, bv) + Math.pow(10.0, br) + 1.0; // I_Total/I_B
        //var bbI = Math.ceil((255.0 / help));
//    rrI = Math.ceil(brightScale * (bandIntens[4][j] / bvr) / rgbVega[0]); /// vegaBVR[2]);
//    ggI = Math.ceil(brightScale * (bandIntens[3][j] / bvr) / rgbVega[1]); /// vegaBVR[1]);
//    bbI = Math.ceil(brightScale * (bandIntens[2][j] / bvr) / rgbVega[2]); /// vegaBVR[0]);
        rrI = saveRGB[0];
        ggI = saveRGB[1];
        bbI = saveRGB[2];
        var starRGBHex = "rgb(" + rrI + "," + ggI + "," + bbI + ")";
        var colors = ["#0000FF", "#00FF88", "#FF0000", wColor, starRGBHex];
        var numZone = radii.length;
        var titleYPos = xLowerYOffset - yRange + 40;
        //var titleXPos = xOffset - xOffset / 2;
        var titleXPos = xOffset;
        washer(xOffset - xRange / 2, yOffset, wColor, plotElevenId);
        // Add title annotation:

        //var titleYPos = xLowerYOffset - 1.15 * yRange;
        //var titleXPos = 1.02 * xOffset;

        txtPrint("<span style='font-size:normal; color:blue' title='Assumes liquid salt-free water at one Earth atmosphere pressure needed for life'><a href='https://en.wikipedia.org/wiki/Circumstellar_habitable_zone' target='_blank'>Life zone for habitable planets</a></span><br />\n\
     <span style='font-size:small'>(Logarithmic radius)</span>",
                titleXPos - 100, titleYPos - 15, zeroInt, zeroInt, zeroInt, plotElevenId);
        var legendYPos = xLowerYOffset - 0.75 * yRange;
        var legendXPos = 1.05 * xOffset;
        txtPrint("<span style='font-size:small'>"
                + " <span style='color:#FF0000'>Steam line</span> " + steamLineAU + " <a href='https://en.wikipedia.org/wiki/Astronomical_unit' title='1 AU = Earths average distance from center of Sun'> AU</a><br /> "
                + " <span style='color:#00FF88'><strong>Life zone</strong></span><br /> "
                + " <span style='color:#0000FF'>Ice line</span> " + iceLineAU + " <a href='https://en.wikipedia.org/wiki/Astronomical_unit' title='1 AU = Earths average distance from center of Sun'> AU</a>"
                + " </span>",
                legendXPos, legendYPos, zeroInt, zeroInt, zeroInt, plotElevenId);
        //Get the Vega-calibrated colors from the intensity spectrum of each theta annulus:    
        // moved earlier var intcolors = iColors(lambdaScale, intens, numDeps, numThetas, numLams, tauRos, temp);

        //intcolors[0][theta]=Ux-B
        //intcolors[1][theta]=B-V
        //intcolors[2][theta]=V-R
        //intcolors[3][theta]=V-I

        //intcolors[4][theta]=R-I
        //var bvr = bandIntens[2][0] + bandIntens[3][0] + bandIntens[4][0];
        //  Loop over radial zones - largest to smallest
        for (var i = 0; i < radii.length; i++) {
//Just do outermost theta:
//i = numThetas-1;

//  for (var i = numThetas2 - 1; i >= 0; i--) {

//ii = 1.0 * i;

//var cosFctr = cosTheta[1][i];

//var radiusPxI = Math.ceil(radiusPx * Math.sin(Math.acos(cosFctr)));

//var radiusStr = numToPxStrng(radiusPx);
//console.log("i " + i + " radii[i] " + radii[i]);
            var radiusStr = numToPxStrng(radii[i]);
            // Adjust position to center star:
            // Radius is really the *diameter* of the symbol
            //var xLowerYOffsetI = xLowerYOffset - radiusPx / 2;
            var xLowerYOffsetI = xLowerYOffset - radii[i] / 2;
            var xLowerYOffsetStr = numToPxStrng(xLowerYOffsetI);
            //var xOffsetI = xOffset - radiusPx / 2;
            var xOffsetI = xOffset - radii[i] / 2;
            var xOffsetStr = numToPxStrng(xOffsetI);
            /*
             //Star
             if (i === numZones - 1) {
             j = 3;  //color near centre:
             rrI = Math.ceil(255.0 * (bandIntens[4][j] / bvr) / vegaBVR[2]);
             ggI = Math.ceil(255.0 * (bandIntens[3][j] / bvr) / vegaBVR[1]);
             bbI = Math.ceil(255.0 * (bandIntens[2][j] / bvr) / vegaBVR[0]);
             }
             //Inside steam line
             if (i === 1) {
             rrI = 255;
             ggI = 255;
             bbI = 255;
             }
             //Inside steam line
             if (i === 1) {
             rrI = 255;
             ggI = 255;
             bbI = 255;
             }
             //Inside ice line and outside steam line: The habitable zone
             if (i === 0) {
             rrI = 0;
             ggI = 200;
             bbI = 200;
             }
             
             //console.log(" rrI: " + rrI + " ggI: " + ggI + " bbI: " + bbI);
             
             var RGBArr = [];
             RGBArr.length = 3;
             RGBArr[0] = rrI;
             RGBArr[1] = ggI;
             RGBArr[2] = bbI;
             
             var starRGBHex = "rgb(" + rrI + "," + ggI + "," + bbI + ")";
             */
            var starId = document.createElement("div");
            starId.class = "star";
            starId.style.display = "block";
            starId.style.position = "absolute";
            starId.style.height = radiusStr;
            starId.style.width = radiusStr;
            //   starId.style.border = tickBorder;
            starId.style.borderRadius = "100%";
            //starId.style.zIndex = "-1"; // put on top    
            starId.style.opacity = "1.0";
            //starId.style.backgroundColor = starRGBHex;
            starId.style.backgroundColor = colors[i];
            starId.style.marginTop = xLowerYOffsetStr;
            starId.style.marginLeft = xOffsetStr;
            //starId.style.border = "1px blue solid";

            plotElevenId.appendChild(starId);
            //

            //
        }  //i loop (thetas)

    }

    //
    //
    //  *****   PLOT NINE / PLOT 9
    //
    //
    // Plot Nine: HRDiagram

    if (ifLineOnly === false) {

//    var plotRow = 0;
//    var plotCol = 0;
        var plotRow = 1;
        var plotCol = 1;
        //var numXTicks = 6;
        // WARNING: Teff axis is backwards!!
        var minXData = logTen(50000.0); //K
        var maxXData = logTen(2000.0); //K
        //console.log("minXData " + minXData + " maxXData " + maxXData);


        var xAxisName = "<span title='Logarithmic surface temperature of spherical blackbody radiation emitter of equivalent bolometric surface flux, in Kelvins (K)'> \n\
     <a href='http://en.wikipedia.org/wiki/Effective_temperature' target='_blank'>\n\
     Log<sub>10</sub> <em>T</em><sub>eff</sub></a> \n\
     (<a href='http://en.wikipedia.org/wiki/Kelvin' target='_blank'>K</a>)</span>";
        //var numYTicks = 6;
        var minYData = -2.0; //solar luminosities;
        var maxYData = 3.5; //solar luminosities


        var yAxisName = "<span title='Logarithmic Bolometric luminosity'>\n\
     <a href='http://en.wikipedia.org/wiki/Luminosity' target='_blank'>\n\
     Log<sub>10</sub><em>L</em><sub>Bol</sub></a></span><br />  \n\
     <span title='Solar luminosities'>\n\
     <a href='http://en.wikipedia.org/wiki/Solar_luminosity' target='_blank'>\n\
     <em>L</em><sub>Sun</sub></a></span> ";
        //
        //console.log("Calling xAxis from HRD plot nine");
        var xAxisParams = XAxis(plotRow, plotCol,
                minXData, maxXData, xAxisName,
                plotNineId);
        var yAxisParams = YAxis(plotRow, plotCol,
                minYData, maxYData, yAxisName,
                plotNineId);
        //
        xOffset = xAxisParams[0];
        yOffset = yAxisParams[4];
        var rangeXData = xAxisParams[1];
        var deltaXData = xAxisParams[2];
        var deltaXPxl = xAxisParams[3];
        var rangeYData = yAxisParams[1];
        var deltaYData = yAxisParams[2];
        var deltaYPxl = yAxisParams[3];
        var xLowerYOffset = xAxisParams[5];
        minXData = xAxisParams[6]; //updated value
        minYData = yAxisParams[6]; //updated value
        maxXData = xAxisParams[7]; //updated value
        maxYData = yAxisParams[7]; //updated value     
        //console.log("minXData " + minXData + " maxXData " + maxXData, " rangeXData " + rangeXData + " deltaXData " + deltaXData);
        //
        var titleYPos = xLowerYOffset - 1.15 * yRange;
        var titleXPos = 1.02 * xOffset;
        txtPrint("<span style='font-size:normal; color:blue'><a href='http://www.ap.smu.ca/~ishort/hrdtest3.html' target='_blank'>H-R Diagram</a></span>",
                titleXPos, titleYPos, zeroInt, zeroInt, zeroInt, plotNineId);
        // *********  Input stellar data

        //Sun

        var sunClass = "G2";
        var sunTeff = 5778;
        // var sunTeff = 10000; //debug test
        var sunB_V = 0.656;
        var sunM_v = 4.83;
        var sunM_Bol = 4.75;
        var sunRad = 1.0;
        // var sunRad = 10.0; //debug test
        var logSunLum = 2.5 * logTen(1.0); //log Suns luminosity in solar luminosities 


        // Carroll & Ostlie, 2nd Ed. , Appendix G:

        //Main sequence

        var msClass = ["O5", "O6", "O7", "O8", "B0", "B1", "B2", "B3", "B5", "B6", "B7", "B8", "B9", "A0", "A1", "A2", "A5", "A8", "F0", "F2", "F5", "F8", "G0", "G2", "G8", "K0", "K1", "K3", "K4", "K5", "K7", "M0", "M1", "M2", "M3", "M4", "M5", "M6", "M7"];
        var msTeffs = [42000, 39500, 37500, 35800, 30000, 25400, 20900, 18800, 15200, 13700, 12500, 11400, 10500, 9800, 9400, 9020, 8190, 7600, 7300, 7050, 6650, 6250, 5940, 5790, 5310, 5150, 4990, 4690, 4540, 4410, 4150, 3840, 3660, 3520, 3400, 3290, 3170, 3030, 2860];
        var msB_V = [-0.33, -0.33, -0.32, -0.32, -0.30, -0.26, -0.24, -0.20, -0.17, -0.15, -0.13, -0.11, -0.07, -0.02, +0.01, +0.05, +0.15, +0.25, +0.30, +0.35, +0.44, +0.52, +0.58, +0.63, +0.74, +0.81, +0.86, +0.96, +1.05, +1.15, +1.33, +1.40, +1.46, +1.49, +1.51, +1.54, +1.64, +1.73, +1.80];
        var msM_v = [-5.1, -5.1, -4.9, -4.6, -3.4, -2.6, -1.6, -1.3, -0.5, -0.1, +0.3, +0.6, +0.8, +1.1, +1.3, +1.5, +2.2, +2.7, +3.0, +3.4, +3.9, +4.3, +4.7, +4.9, +5.6, +5.7, +6.0, +6.5, +6.7, +7.1, +7.8, +8.9, +9.6, 10.4, 11.1, 11.9, 12.8, 13.8, 14.7];
        var msBC = [-4.40, -3.93, -3.68, -3.54, -3.16, -2.70, -2.35, -1.94, -1.46, -1.21, -1.02, -0.80, -0.51, -0.30, -0.23, -0.20, -0.15, -0.10, -0.09, -0.11, -0.14, -0.16, -0.18, -0.20, -0.40, -0.31, -0.37, -0.50, -0.55, -0.72, -1.01, -1.38, -1.62, -1.89, -2.15, -2.38, -2.73, -3.21, -3.46];
        var msMass = [60, 37, 29, 23, 17.5, 13.0, 10.0, 7.6, 5.9, 4.8, 4.3, 3.8, 3.2, 2.9, 2.5, 2.2, 2.0, 1.7, 1.6, 1.5, 1.4, 1.2, 1.05, 0.90, 0.83, 0.79, 0.75, 0.72, 0.69, 0.67, 0.55, 0.51, 0.43, 0.40, 0.33, 0.26, 0.21, 0.13, 0.10];
        //var msRads = [13.4 ,12.2 ,11.0 ,10.0 , 6.7 , 5.2 , 4.1 , 3.8 , 3.2 , 2.9 , 2.7 , 2.5 , 2.3 , 2.2 , 2.1 , 2.0 , 1.8 , 1.5 , 1.4 , 1.3 , 1.2 , 1.1 , 1.06, 1.03, 0.96, 0.93, 0.91, 0.86, 0.83, 0.80, 0.74, 0.63, 0.56, 0.48, 0.41, 0.35, 0.29, 0.24, 0.20];
        //var msM_Bol = [-9.51,-9.04,-8.60,-8.18,-6.54,-5.26,-3.92,-3.26,-1.96,-1.35,-0.77,-0.22,+0.28,+0.75,+1.04,+1.31,+2.02,+2.61,+2.95,+3.27,+3.72,+4.18,+4.50,+4.66,+5.20,+5.39,+5.58,+5.98,+6.19,+6.40,+6.84,+7.52,+7.99,+8.47,+8.97,+9.49,10.1 ,10.6 ,11.3];

        //Needed for tick mark placement in pixels:

        //var maxMsTeff = msTeffs[0];
        //var minMsTeff = msTeffs[msTeffs.length - 1];
        //var maxMsM_v = msM_v[msM_v.length - 1];
        //var minMsM_v = msM_v[0];
        // Main sequence data processing:


        var msNum = msClass.length;
        var msM_Bol = [];
        var logR45 = [];
        var logR = [];
        var msRads = [];
        var msLogLum = [];
        msM_Bol.length = msNum;
        logR45.length = msNum;
        logR.length = msNum;
        msRads.length = msNum;
        msLogLum.length = msNum;
        // Calculate radii in solar radii:
        // For MS stars, do the Luminosity as well

        for (var i = 0; i < msNum; i++) {

            msM_Bol[i] = msM_v[i] + msBC[i];
            var msTeffSol = msTeffs[i] / sunTeff;
            logR45[i] = 2.5 * logSunLum + sunM_Bol - 10.0 * logTen(msTeffSol) - msM_Bol[i];
            logR[i] = logR45[i] / 4.5;
            msRads[i] = Math.exp(Math.LN10 * logR[i]); //No base ten exponentiation in JS!
            var msLogL = (sunM_Bol - msM_Bol[i]) / 2.5;
            // Round log(Lum) to 1 decimal place:
            msLogL = 10.0 * msLogL;
            msLogL = Math.floor(msLogL);
            msLogLum[i] = msLogL / 10.0;
        } // end i loop


// Giants:

        var rgbClass = ["O5", "O6", "O7", "O8", "B0", "B1", "B2", "B3", "B5", "B6", "B7", "B8", "B9", "A0", "A1", "A2", "A5", "A8", "F0", "F2", "F5", "G0", "G2", "G8", "K0", "K1", "K3", "K4", "K5", "K7", "M0", "M1", "M2", "M3", "M4", "M5", "M6"];
        var rgbTeffs = [39400, 37800, 36500, 35000, 29200, 24500, 20200, 18300, 15100, 13800, 12700, 11700, 10900, 10200, 9820, 9460, 8550, 7830, 7400, 7000, 6410, 5470, 5300, 4800, 4660, 4510, 4260, 4150, 4050, 3870, 3690, 3600, 3540, 3480, 3440, 3380, 3330];
        var rgbB_V = [-0.32, -0.32, -0.32, -0.31, -0.29, -0.26, -0.24, -0.20, -0.17, -0.15, -0.13, -0.11, -0.07, -0.03, +0.01, +0.05, +0.15, +0.25, +0.30, +0.35, +0.43, +0.65, +0.77, +0.94, +1.00, +1.07, +1.27, +1.38, +1.50, +1.53, +1.56, +1.58, +1.60, +1.61, +1.62, +1.63, +1.52];
        var rgbM_v = [-5.9, -5.7, -5.6, -5.5, -4.7, -4.1, -3.4, -3.2, -2.3, -1.8, -1.4, -1.0, -0.6, -0.4, -0.2, -0.1, +0.6, +1.0, +1.3, +1.4, +1.5, +1.3, +1.3, +1.0, +1.0, +0.9, +0.8, +0.8, +0.7, +0.4, +0.0, -0.2, -0.4, -0.4, -0.4, -0.4, -0.4];
        var rgbBC = [-4.05, -3.80, -3.58, -3.39, -2.88, -2.43, -2.02, -1.60, -1.30, -1.13, -0.97, -0.82, -0.71, -0.42, -0.29, -0.20, -0.14, -0.10, -0.11, -0.11, -0.14, -0.20, -0.27, -0.42, -0.50, -0.55, -0.76, -0.94, -1.02, -1.17, -1.25, -1.44, -1.62, -1.87, -2.22, -2.48, -2.73];
        //var rgbRads = [18.5,16.8,15.4,14.3,11.4,10.0, 8.6, 8.0, 6.7, 6.1, 5.5, 5.0, 4.5, 4.1, 3.9, 3.7, 3.3, 3.1, 3.2, 3.3, 3.8, 6.0, 6.7, 9.6,10.9,12.5,16.4,18.7,21.4,27.6,39.3,48.6,58.5,69.7,82.0,96.7,16];
        //var rgbM_Bol = [-9.94,-9.55,-9.20,-8.87,-7.58,-6.53,-5.38,-4.78,-3.56,-2.96,-2.38,-1.83,-1.31,-0.83,-0.53,-0.26,+0.44,+0.95,+1.17,+1.31,+1.37,+1.10,+1.00,+0.63,+0.48,+0.32,-0.01,-0.18,-0.36,-0.73,-1.28,-1.64,-1.97,-2.28,-2.57,-2.86,-3.18];

        // RGB sequence data processing:


        var rgbNum = rgbClass.length;
        var rgbM_Bol = [];
        var logR45 = [];
        var logR = [];
        var rgbRads = [];
        var rgbLogLum = [];
        rgbM_Bol.length = rgbNum;
        logR45.length = rgbNum;
        logR.length = rgbNum;
        rgbRads.length = rgbNum;
        // Calculate radii in solar radii:

        for (var i = 0; i < rgbNum; i++) {

            rgbM_Bol[i] = rgbM_v[i] + rgbBC[i];
            var rgbTeffSol = rgbTeffs[i] / sunTeff;
            logR45[i] = 2.5 * logSunLum + sunM_Bol - 10.0 * logTen(rgbTeffSol) - rgbM_Bol[i];
            logR[i] = logR45[i] / 4.5;
            rgbRads[i] = Math.exp(Math.LN10 * logR[i]); //No base ten exponentiation in JS!

            var rgbLogL = (sunM_Bol - rgbM_Bol[i]) / 2.5;
            // Round log(Lum) to 1 decimal place:
            rgbLogL = 10.0 * rgbLogL;
            rgbLogL = Math.floor(rgbLogL);
            rgbLogLum[i] = rgbLogL / 10.0;
        } // end i loop


// No! Too bright for what GrayStar can model!
// //Supergiants:
//
// var sgbClass = ["O5", "O6", "O7", "O8", "B0", "B1", "B2", "B3", "B5", "B6", "B7", "B8", "B9", "A0", "A1", "A2", "A5", "A8", "F0", "F2", "F5", "F8", "G0", "G2", "G8", "K0", "K1", "K3", "K4", "K5", "K7", "M0", "M1", "M2", "M3", "M4", "M5", "M6"];
// var sgbTeffs = [40900, 38500, 36200, 34000, 26200, 21400, 17600, 16000, 13600, 12600, 11800, 11100, 10500, 9980, 9660, 9380, 8610, 7910, 7460, 7030, 6370, 5750, 5370, 5190, 4700, 4550, 4430, 4190, 4090, 3990, 3830, 3620, 3490, 3370, 3210, 3060, 2880, 2710];
// var sgbB_V = [-0.31, -0.31, -0.31, -0.29, -0.23, -0.19, -0.17, -0.13, -0.10, -0.08, -0.05, -0.03, -0.02, -0.01, +0.02, +0.03, +0.09, +0.14, +0.17, +0.23, +0.32, +0.56, +0.76, +0.87, +1.15, +1.24, +1.30, +1.46, +1.53, +1.60, +1.63, +1.67, +1.69, +1.71, +1.69, +1.76, +1.80, +1.86];
//  var sgbM_v = [-6.5, -6.5, -6.6, -6.6, -6.9, -6.9, -6.7, -6.7, -6.6, -6.4, -6.3, -6.3, -6.3, -6.3, -6.3, -6.3, -6.3, -6.4, -6.4, -6.4, -6.4, -6.4, -6.3, -6.3, -6.1, -6.1, -6.0, -5.9, -5.8, -5.7, -5.6, -5.8, -5.8, -5.8, -5.5, -5.2, -4.8, -4.9];
// var sgbBC = [-3.87, -3.74, -3.48, -3.35, -2.49, -1.87, -1.58, -1.26, -0.95, -0.88, -0.78, -0.66, -0.52, -0.41, -0.32, -0.28, -0.13, -0.03, -0.01, 0.00, -0.03, -0.09, -0.15, -0.21, -0.42, -0.50, -0.56, -0.75, -0.90, -1.01, -1.20, -1.29, -1.38, -1.62, -2.13, -2.75, -3.47, -3.90];
//  
//  //var sgbRads = [21,  22,  23,  25,  31,  37,  42,  45,  51,  53,  56,  58,  61,  64,  67,  69,  78,  91, 102, 114, 140, 174, 202, 218, 272, 293, 314, 362, 386, 415, 473, 579, 672, 791, 967,1220,1640,2340];
//  //var sgbM_Bol = [-10.4,-10.2,-10.1, -9.9, -9.3, -8.8, -8.2, -7.9, -7.5, -7.3, -7.1, -6.9, -6.8, -6.7, -6.6, -6.5, -6.4, -6.4, -6.4, -6.4, -6.4, -6.4, -6.4, -6.4, -6.5, -6.5, -6.5, -6.6, -6.7, -6.7, -6.8, -7.0, -7.2, -7.4, -7.6, -7.9, -8.3, -8.8];
// 
//  // SGB sequence data processing:
// 
// 
//  var sgbNum = sgbClass.length;
// 
//  var sgbM_Bol = [];
// var logR45 = [];
//  var logR = [];
//  var sgbRads = [];
//  var sgbLogLum = [];
//  
// sgbM_Bol.length = sgbNum;
//  logR45.length = sgbNum;
//  logR.length = sgbNum;
//   sgbRads.length = sgbNum;
//  
//   
//  // Calculate radii in solar radii:
//   
//  for (var i = 0; i < sgbNum; i++) {
//  
// sgbM_Bol[i] = sgbM_v[i] + sgbBC[i];
//  var sgbTeffSol = sgbTeffs[i] / sunTeff;
//  
//  logR45[i] = 2.5 * logSunLum + sunM_Bol - 10.0 * logTen(sgbTeffSol) - sgbM_Bol[i];
//  logR[i] = logR45[i] / 4.5;
//  sgbRads[i] = Math.exp(Math.LN10 * logR[i]);  //No base ten exponentiation in JS!
//  
//  var sgbLogL = (sunM_Bol - sgbM_Bol[i]) / 2.5;
//  // Round log(Lum) to 1 decimal place:
//  sgbLogL = 10.0 * sgbLogL;
//  sgbLogL = Math.floor(sgbLogL);
//  sgbLogLum[i] = sgbLogL / 10.0;
//  
//  } // end i loop
// 

//Data loops - plot the result!

//MS stars

        var dSize = 2.0; //plot point size
        var opac = 0.7; //opacity
        // RGB color
        var r255 = 50;
        var g255 = 50;
        var b255 = 50; //dark gray

        var ii;
        //for (var i = 5; i < msNum - 3; i++) {
        for (var i = 4; i < msNum - 1; i++) {

            ii = 1.0 * i;
            var xTickPos = xRange * (logTen(msTeffs[i]) - minXData) / rangeXData; // pixels   

            // horizontal position in pixels - data values increase rightward:
            var xShift = xOffset + xTickPos;
            ////stringify and add unit:
            //        var xShiftStr = numToPxStrng(xShift);

            var yTickPos = yRange * (msLogLum[i] - minYData) / rangeYData;
            // vertical position in pixels - data values increase upward:
            var yShift = xLowerYOffset - yTickPos;
            ////stringify and add unit:
            //       var yShiftStr = numToPxStrng(yShift);

            plotPnt(xShift, yShift, r255, g255, b255, opac, dSize, plotNineId);
        }


//RGB stars

// RGB color
        var r255 = 100;
        var g255 = 100;
        var b255 = 100; //gray

        var ii;
        //for (var i = 4; i < rgbNum - 2; i++) {
        for (var i = 3; i < rgbNum - 1; i++) {

            ii = 1.0 * i;
            var xTickPos = xRange * (logTen(rgbTeffs[i]) - minXData) / rangeXData; // pixels   

            // horizontal position in pixels - data values increase rightward:
            var xShift = xOffset + xTickPos;
            ////stringify and add unit:
            //        var xShiftStr = numToPxStrng(xShift);

            var yTickPos = yRange * (rgbLogLum[i] - minYData) / rangeYData;
            // vertical position in pixels - data values increase upward:
            var yShift = xLowerYOffset - yTickPos;
            ////stringify and add unit:
            //       var yShiftStr = numToPxStrng(yShift);

            plotPnt(xShift, yShift, r255, g255, b255, opac, dSize, plotNineId);
        }


// No! Too bright for what GrayStar can model!
// //SGB stars
// 
// // RGB color
// var r255 = 150;
// var g255 = 150;
// var b255 = 150; //light gray
//  
// var ii;
// for (var i = 4; i < sgbNum - 3; i++) {
//  
//  ii = 1.0 * i;
//  var xTickPos = xRange * (logTen(sgbTeffs[i]) - minXData) / rangeXData; // pixels   
//  
//  // horizontal position in pixels - data values increase rightward:
// var xShift = xOffset + xTickPos;
// ////stringify and add unit:
// //        var xShiftStr = numToPxStrng(xShift);
// 
//  var yTickPos = yRange * (sgbLogLum[i] - minYData) / rangeYData;
// // vertical position in pixels - data values increase upward:
//  var yShift = xLowerYOffset - yTickPos;
// ////stringify and add unit:
//  //       var yShiftStr = numToPxStrng(yShift);
// 
//  plotPnt(xShift, yShift, r255, g255, b255, opac, dSize, plotNineId);
// 
// 
//  }
// 


// Now overplot our star:
//console.log("teff, bolLum, radiusPxI, rrI, ggI, bbI: " +
//        teff + " " + bolLum + " " + radiusPxI + " " + rrI + " " + ggI + " " + bbI);
        var xTickPos = xRange * (logTen(teff) - minXData) / rangeXData; // pixels   
        // horizontal position in pixels - data values increase rightward:
        var xShift = xOffset + xTickPos;
        var yTickPos = yRange * (logTen(bolLum) - minYData) / rangeYData;
        // vertical position in pixels - data values increase upward:
        var yShift = xLowerYOffset - yTickPos;
        //Take color and radius from the last step of the star rendering loop (plot Seve) - that should be the inner-most disk:
        //console.log("saveRadius " + saveRadius + " saveRGB[0], saveRGB[1], saveRGB[2] " + saveRGB[0] + " " + saveRGB[1] + " " + saveRGB[2]);
        var radiusPxThis = saveRadius / 5;
        var rrI = saveRGB[0];
        var ggI = saveRGB[1];
        var bbI = saveRGB[2];
        plotPnt(xShift, yShift, zeroInt, zeroInt, zeroInt, opac, 1.05 * radiusPxThis, plotNineId); //black border to bring attention
        plotPnt(xShift, yShift, rrI, ggI, bbI, opac, radiusPxThis, plotNineId);
        //Now overplot Luminosity class markers:

        //    //I
        //    xShift = xOffset + xRange * (logTen(sgbTeffs[sgbNum - 2]) - minXData) / rangeXData; // pixels 
        //    yShift = xLowerYOffset - (yRange * (sgbLogLum[sgbNum - 1] - minYData) / rangeYData);
        //    txtPrint("<span style='font-size:normal'><a href='http://en.wikipedia.org/wiki/Stellar_classification' target='_blank'>\n\
        // I</a></span>", xShift, yShift, 50, 50, 50, plotNineId);
        //III
        xShift = xOffset + xRange * (logTen(rgbTeffs[rgbNum - 8]) - minXData) / rangeXData; // pixels 
        yShift = xLowerYOffset - (yRange * (rgbLogLum[rgbNum - 8] - minYData) / rangeYData);
        txtPrint("<span style='font-size:normal'><a href='http://en.wikipedia.org/wiki/Stellar_classification' title='Giants' target='_blank'>\n\
     III</a></span>", xShift, yShift, 50, 50, 50, plotNineId);
        //V
        xShift = xOffset + xRange * (logTen(msTeffs[msNum - 8]) - minXData) / rangeXData; // pixels 
        yShift = xLowerYOffset - (yRange * (msLogLum[msNum - 8] - minYData) / rangeYData);
        txtPrint("<span style='font-size:normal'><a href='http://en.wikipedia.org/wiki/Stellar_classification' title='Main Sequence, Dwarfs' target='_blank'>\n\
     V</a></span>", xShift, yShift, 50, 50, 50, plotNineId);
    }

    /*
     //
     //
     //  *****   PLOT ONE / PLOT 1
     //
     //
     
     // Plot one: depth vs Temp
     
     
     var plotRow = 2;
     var plotCol = 2;
     //var numXTicks = 6;
     //var minXData = (1.0E-5 * depths[0]) - 100.0; // cm to km
     //var maxXData = (1.0E-5 * depths[numDeps - 1]) + 100.0; // cm to km
     
     // No!  We cannot compute depths realistically with our fake opacity module
     //    var xAxisName = "Depth (km)";
     //    //var numYTicks = 6;
     var minYData = temp[0][0] - 1000.0;
     var maxYData = temp[0][numDeps - 1] + 1000.0;
     //   var yAxisName = "<em>T</em><sub>Kin</sub> (K)";
     //    var xAxisParams = XAxis(plotRow, plotCol,
     //           minXData, maxXData, xAxisName,
     //            plotOneId);
     //    var yAxisParams = YAxis(plotRow, plotCol,
     //           minYData, maxYData, yAxisName,
     //            plotOneId);
     //    xOffset = xAxisParams[0];
     //    yOffset = yAxisParams[4];
     //    var rangeXData = xAxisParams[1];
     //   var deltaXData = xAxisParams[2];
     //    var deltaXPxl = xAxisParams[3];
     //    var rangeYData = yAxisParams[1];
     //    var deltaYData = yAxisParams[2];
     //    var deltaYPxl = yAxisParams[3];
     //   var xLowerYOffset = xAxisParams[5];
     //   minXData = xAxisParams[6]; //updated value
     //   minYData = yAxisParams[6]; //updated value
     //   //
     // Tau=1 cross-hair
     //
     var tTau1 = tauPoint(numDeps, tauRos, 1.0);
     // Vertical bar:
     //klmtrs = 1.0E-5 * depths[tTau1]; // cm to km
     //
     // No!  We cannot compute depths realistically with our fake opacity module
     //    var barWidth = 1.0;
     //    var barColor = "#777777";
     //   xShift = YBar(plotRow, plotCol,
     //           klmtrs, minXData, maxXData, barWidth, yRange,
     //            yFinesse, barColor, plotOneId);
     //   //console.log("Bar: xShift = " + xShift);
     //
     //   yShift = XBar(plotRow, plotCol,
     //            temp[0][tTau1], minYData, maxYData,
     //           barColor, plotOneId);
     //   //
     //   // Add label
     //  //txtPrint("<span title='Rosseland mean optical depth' style='font-size:small; color:#444444'>&#964<sub>Ros</sub>=1</span>", 
     //   //  xShift + 5, yShift - 25, zeroInt, zeroInt, zeroInt, masterId);
     //    txtPrint("<span title='Rosseland mean optical depth' style='font-size:small; color:#444444'>&#964<sub>Ros</sub>=1</span>",
     //           xShift + 5, yShift - 175, zeroInt, zeroInt, zeroInt, plotOneId);
     // Tau_lambda(lambda_0) = 1 cross-hair
     
     // Get depth index where monochromatic line center Tau_l ~ 1:
     var indxLam0 = keyLambds[0]; // line center
     var tauLam0r0 = [];
     tauLam0r0.length = numDeps;
     var tauLam0r1 = [];
     tauLam0r1.length = numDeps;
     var tauLam0 = [tauLam0r0, tauLam0r1];
     for (var i = 0; i < numDeps - 1; i++) {
     tauLam0[0][i] = Math.exp(logTauL[indxLam0][i]);
     tauLam0[1][i] = logTauL[indxLam0][i];
     }
     //var tTauL1 = tauPoint(numDeps, tauLam0, 1.0);
     // Vertical bar:
     //klmtrs = 1.0E-5 * depths[tTauL1]; // cm to km
     //
     // No!  We cannot compute depths realistically with our fake opacity module
     //   var barWidth = 1.0;
     //    var barColor = "#00FF77";
     //    xShift = YBar(plotRow, plotCol,
     //            klmtrs, minXData, maxXData, barWidth, yRange,
     //           yFinesse, barColor, plotOneId);
     //    //console.log("Bar: xShift = " + xShift);
     //
     //   yShift = XBar(plotRow, plotCol,
     //           temp[0][tTauL1], minYData, maxYData,
     //           barColor, plotOneId);
     //   //console.log("Bar: yShift = " + yShift);
     //
     //   // Add label
     //   //txtPrint("<span style='font-size:small'>&#964<sub>&#955_0</sub>=1</span>", xShift - 35, yShift - 25, 0, 255, 100, masterId);
     //   txtPrint("<span style='font-size:small'>&#964<sub>&#955_0</sub>=1</span>", xShift - 35, yShift - 175, 0, 255, 100, plotOneId);
     //   var titleYPos = xLowerYOffset - 1.15 * yRange;
     //  var titleXPos = 1.02 * xOffset;
     //   //txtPrint("<span style='font-size:normal; color:blue'>Gas temperature <em>vs</em> depth </span>",
     //   //        titleXPos, titleYPos - 35, zeroInt, zeroInt, zeroInt, masterId);
     //   txtPrint("<span style='font-size:normal; color:blue'>Gas temperature <em>vs</em> depth </span>",
     //           titleXPos, titleYPos - 35, zeroInt, zeroInt, zeroInt, plotOneId);
     //Data loop - plot the result!
     // No!  We cannot compute depths realistically with our fake opacity module   
     //    var dSize = 5.0; //plot point size
     //    var opac = 1.0; //opacity
     //   // RGB color
     //   var r255 = 0;
     //   var g255 = 0;
     //   var b255 = 255; //blue 
     //
     //  var ii;
     var klmtrs;
     
     //  for (var i = 0; i < numDeps; i++) {
     //
     //       ii = 1.0 * i;
     //      klmtrs = 1.0E-5 * depths[i]; // cm to km
     //      var xTickPos = xRange * (klmtrs - minXData) / rangeXData; // pixels   
     //
     //      // horizontal position in pixels - data values increase rightward:
     //       var xShift = xOffset + xTickPos;
     //      ////stringify and add unit:
     //       //        var xShiftStr = numToPxStrng(xShift);
     //
     //      var yTickPos = yRange * (temp[0][i] - minYData) / rangeYData;
     //       // vertical position in pixels - data values increase upward:
     //      var yShift = xLowerYOffset - yTickPos;
     //       ////stringify and add unit:
     //      //       var yShiftStr = numToPxStrng(yShift);
     //
     //      plotPnt(xShift, yShift, r255, g255, b255, opac, dSize, plotOneId);
     //  }
     
     //masterId.appendChild(plotOneId);
     */


// ****************************************
    //
    //
    //  *****   PLOT ONE / PLOT 1
    //

    //console.log("plotOneId.style.display: " + plotOneId.style.display);
    // Plot one: log(Tau) vs log(rho)
    //console.log("PLOT ONE: ifAtmosShow= " + ifAtmosShow);
    if ((ifLineOnly === false) && (ifShowAtmos === true)) {
        //console.log("PLOT ONE");
        //   var plotRow = 1;
        //   var plotCol = 0;
        var plotRow = 3;
        var plotCol = 2;
        //var numXTicks = 6;
        var minXData = logE * tauRos[1][0] - 2.0;
        var maxXData = logE * tauRos[1][numDeps - 1];
        var xAxisName = "<span title='Rosseland mean optical depth'><a href='http://en.wikipedia.org/wiki/Optical_depth_%28astrophysics%29' target='_blank'>Log<sub>10</sub> <em>&#964</em><sub>Ros</sub></a></span>";
        // Don't use upper boundary condition as lower y-limit - use a couple of points below surface:
        //var numYTicks = 6;
        // Build total P from P_Gas & P_Rad:

        var minYData = logE * rho[1][2]; // Avoid upper boundary condition [i]=0
        var maxYData = logE * rho[1][numDeps - 1];
        var yAxisName = "Log<sub>10</sub> <em>&#961</em> <br />(g cm<sup>-3</sup>)";
        //washer(xRange, xOffset, yRange, yOffset, wColor, plotOneId);

        var xAxisParams = XAxis(plotRow, plotCol,
                minXData, maxXData, xAxisName,
                plotOneId);
        var yAxisParams = YAxis(plotRow, plotCol,
                minYData, maxYData, yAxisName,
                plotOneId);
        xOffset = xAxisParams[0];
        yOffset = xAxisParams[4];
        var rangeXData = xAxisParams[1];
        var deltaXData = xAxisParams[2];
        var deltaXPxl = xAxisParams[3];
        var rangeYData = yAxisParams[1];
        var deltaYData = yAxisParams[2];
        var deltaYPxl = yAxisParams[3];
        var xLowerYOffset = xAxisParams[5];
        minXData = xAxisParams[6]; //updated value
        minYData = yAxisParams[6]; //updated value
        maxXData = xAxisParams[7]; //updated value
        maxYData = yAxisParams[7]; //updated value        
        //
        var legendYPos = xLowerYOffset - 1.05 * yRange;
        var legendXPos = 1.1 * xOffset;
        txtPrint("log<sub>10</sub> <a href='http://en.wikipedia.org/wiki/Gas_laws' title='mass density' target='_blank'>Density</a>",
                legendXPos - 20, legendYPos - 20, zeroInt, zeroInt, zeroInt, plotOneId);
//    txtPrint("<a href='http://en.wikipedia.org/wiki/Gas_laws'>Density</a>",
        //           legendXPos - 20, legendYPos - 20, zeroInt, zeroInt, zeroInt, plotOneId);                      
        //txtPrint(" <a href='http://en.wikipedia.org/wiki/Gas_laws' target='_blank'><span title='Gas pressure'><em>P</em><sub>Gas</sub></span></a> ",
        //        legendXPos + 140, legendYPos - 20, 0, 255, 0, masterId);

        //Data loop - plot the result!

        var dSize = 6.0; //plot point size
        var dSizeG = 4.0;
        var opac = 1.0; //opacity
        // RGB color
        // PTot:
        var r255 = 0;
        var g255 = 0;
        var b255 = 255; //blue 
        // PGas:
        var r255G = 0;
        var g255G = 255;
        var b255G = 100; //green
        // PRad:
        var r255R = 255;
        var g255R = 0;
        var b255R = 0; //red

        var ii;
        // Avoid upper boundary at i=0
        for (var i = 2; i < numDeps; i++) {

            ii = 1.0 * i;
            var xTickPos = xRange * (logE * tauRos[1][i] - minXData) / rangeXData; // pixels   

            // horizontal position in pixels - data values increase rightward:
            var xShift = xOffset + xTickPos;
            ////stringify and add unit:
            //        var xShiftStr = numToPxStrng(xShift);

            var yTickPos = yRange * (logE * rho[1][i] - minYData) / rangeYData;
            // vertical position in pixels - data values increase upward:
            var yShift = xLowerYOffset - yTickPos;
            ////stringify and add unit:
            //       var yShiftStr = numToPxStrng(yShift);

            plotPnt(xShift, yShift, r255, g255, b255, opac, dSize, plotOneId);
        }

// Tau=1 cross-hair

        var tTau1 = tauPoint(numDeps, tauRos, 1.0);
        var barWidth = 1.0;
        var barColor = "#777777";
        xShift = YBar(plotRow, plotCol,
                logE * tauRos[1][tTau1], minXData, maxXData, barWidth, yRange,
                yFinesse, barColor, plotOneId);
        //console.log("Bar: xShift = " + xShift);

        //console.log("PLOT THREE: logE*logPTot[tTau1] " + logE * logPTot[tTau1]);
        yShift = XBar(plotRow, plotCol,
                logE * rho[1][tTau1], minYData, maxYData,
                barColor, plotOneId);
        txtPrint("<span style='font-size:small; color:#444444'><em>&#964</em><sub>Ros</sub>=1</span>",
                xShift + 10, yShift - 50, zeroInt, zeroInt, zeroInt, plotOneId);
    }
//
//
//  *****   PLOT TWO / PLOT 2
//
//

// Plot two: log(Tau) vs Temp
// 
    if ((ifLineOnly === false) && (ifShowAtmos === true)) {

        //console.log("PLOT TWO");
        //var plotRow = 0;
        //var plotCol = 2;

        var plotRow = 1;
        var plotCol = 2;
        //var numXTicks = 6;
        var minXData = logE * tauRos[1][0];
        var maxXData = logE * tauRos[1][numDeps - 1];
        var xAxisName = "<span title='Rosseland mean optical depth'><a href='http://en.wikipedia.org/wiki/Optical_depth_%28astrophysics%29' target='_blank'>Log<sub>10</sub> <em>&#964</em><sub>Ros</sub></a></span>";
        //var numYTicks = 6;
        var minYData = temp[0][0];
        var maxYData = temp[0][numDeps - 1];
        var yAxisName = "<em>T</em><sub>Kin</sub> (K)";
        //washer(xRange, xOffset, yRange, yOffset, wColor, plotTwoId);
        //
        //console.log("PLOT TWO: Before Axis(): minXData " + minXData + " minYData " + minYData);
        var xAxisParams = XAxis(plotRow, plotCol,
                minXData, maxXData, xAxisName,
                plotTwoId);
        var yAxisParams = YAxis(plotRow, plotCol,
                minYData, maxYData, yAxisName,
                plotTwoId);
        //
        xOffset = xAxisParams[0];
        yOffset = xAxisParams[4];
        var rangeXData = xAxisParams[1];
        var deltaXData = xAxisParams[2];
        var deltaXPxl = xAxisParams[3];
        var rangeYData = yAxisParams[1];
        var deltaYData = yAxisParams[2];
        var deltaYPxl = yAxisParams[3];
        var xLowerYOffset = xAxisParams[5];
        minXData = xAxisParams[6]; //updated value
        minYData = yAxisParams[6]; //updated value
        maxXData = xAxisParams[7]; //updated value
        maxYData = yAxisParams[7]; //updated value    
        //console.log("PLOT TWO: After Axis(): minXData " + minXData + " minYData " + minYData);
        //
        // Tau=1 cross-hair

        var barWidth = 1.0;
        var barColor = "#777777";
        var tTau1 = tauPoint(numDeps, tauRos, 1.0);
        //console.log("logE * tauRos[1][tTau1]" + logE * tauRos[1][tTau1]);
        xShift = YBar(plotRow, plotCol,
                logE * tauRos[1][tTau1], minXData, maxXData, barWidth, yRange,
                yFinesse, barColor, plotTwoId);
        //console.log("Bar: xShift = " + xShift);

        //console.log("PLOT TWO: temp[0][tTau1] " + temp[0][tTau1]);
        yShift = XBar(plotRow, plotCol,
                temp[0][tTau1], minYData, maxYData,
                barColor, plotTwoId);
        // Add label
        //txtPrint("<span style='font-size:small; color:#444444'>&#964<sub>Ros</sub>=1</span>",
        //        xShift + 10, yShift - 25, zeroInt, zeroInt, zeroInt, masterId);
        txtPrint("<span style='font-size:small; color:#444444'><em>&#964</em><sub>Ros</sub>=1</span>",
                xShift + 10, yShift - 175, zeroInt, zeroInt, zeroInt, plotTwoId);
        // Tau_lambda(lambda_0) = 1 cross-hair

        // Get depth index where monochromatic line center Tau_l ~ 1:
        var indxLam0 = keyLambds[0]; // line center
        var tauLam0 = [];
        tauLam0.length = 2;
        tauLam0[0] = [];
        tauLam0[1] = [];
        tauLam0[0].length = numDeps;
        tauLam0[1].length = numDeps;
        for (var i = 0; i < numDeps - 1; i++) {
            tauLam0[0][i] = Math.exp(logTauL[indxLam0][i]);
            tauLam0[1][i] = logTauL[indxLam0][i];
        }
        var tTauL1 = tauPoint(numDeps, tauLam0, 1.0);
        var barWidth = 1.0;
        var barColor = "#00FF77";
        //console.log("logE * tauRos[1][tTauL1] " + logE * tauRos[1][tTauL1]);

        xShift = YBar(plotRow, plotCol,
                logE * tauRos[1][tTauL1], minXData, maxXData, barWidth, yRange,
                yFinesse, barColor, plotTwoId);
        //console.log("Bar: xShift = " + xShift);

        yShift = XBar(plotRow, plotCol,
                temp[0][tTauL1], minYData, maxYData,
                barColor, plotTwoId);
        // Add label
        //txtPrint("<span style='font-size:small'>&#964<sub>&#955_0</sub>=1</span>", 
        //   xShift - 35, yShift - 25, 0, 255, 100, masterId);
        txtPrint("<span style='font-size:small'><em>&#964</em><sub><em>&#955</em>_0</sub>=1</span>",
                xShift - 35, yShift - 175, 0, 255, 100, plotTwoId);
        var titleYPos = xLowerYOffset - 1.15 * yRange;
        var titleXPos = 1.02 * xOffset;
        //txtPrint("<span style='font-size:normal; color:blue'>Gas temperature <em>vs</em> log &#964 </span>",
        //        titleXPos, titleYPos - 40, zeroInt, zeroInt, zeroInt, masterId);
        txtPrint("<span style='font-size:normal; color:blue'>Gas temperature </span>",
                titleXPos, titleYPos - 40, zeroInt, zeroInt, zeroInt, plotTwoId);
        //Data loop - plot the result!

        var dSize = 5.0; //plot point size
        var opac = 1.0; //opacity
        // RGB color
        var r255 = 0;
        var g255 = 0;
        var b255 = 255; //blue

        var ii;
        for (var i = 0; i < numDeps; i++) {

            //FROM XAxis():
            //       var deltaXPxl = xRange / (numXTicks);
            //for (var i = 0; i < numXTicks; i++) {
            //    ii = 1.0 * i;
            //  var xTickPos = ii * deltaXPxl;

            ii = 1.0 * i;
            var xTickPos = xRange * (logE * tauRos[1][i] - minXData) / rangeXData; // pixels   
            //console.log("PLOT TWO: logE * tauRos[1][i] " + logE * tauRos[1][i] + " xTickPos " + xTickPos);

            // horizontal position in pixels - data values increase rightward:
            var xShift = xOffset + xTickPos;
            ////stringify and add unit:
            //        var xShiftStr = numToPxStrng(xShift);

            var yTickPos = yRange * (temp[0][i] - minYData) / rangeYData;
            // vertical position in pixels - data values increase upward:
            var yShift = xLowerYOffset - yTickPos;
            ////stringify and add unit:
            //       var yShiftStr = numToPxStrng(yShift);

            plotPnt(xShift, yShift, r255, g255, b255, opac, dSize, plotTwoId);
        }

//  Loop over limb darkening sub-disks - largest to smallest, and add color-coded Tau(theta) = 1 markers

//now done above        var iLamMinMax = minMax2(masterFlux);
//now done above        var iLamMax = iLamMinMax[1];
        dSize = 8.0;
        //Get the band-integrated intensities from the intensity spectrum of each theta annulus:   
        //var intcolors = iColors(masterLams, masterIntens, numDeps, numThetas, numLams, tauRos, temp);
        //intcolors[0][theta]=Ux-Bx
        //intcolors[1][theta]=B-V
        //intcolors[2][theta]=V-R
        //intcolors[3][theta]=V-I
        //intcolors[4][theta]=R-I

        // now done above: var bandIntens = iColors(masterLams, masterIntens, numDeps, numThetas, numMaster, tauRos, temp);
        ////bandIntens[0]=Ux
        ////bandIntens[1]=Bx
        ////bandIntens[2]=B
        ////bandIntens[3]=V
        ////bandIntens[4]=R
        ////bandIntens[5]=I
        //var bv, vr, br, rb, rv, vb, help;


        // Disk centre:
        //This approach does not allow for calibration easily:
        //now done earlier var bvr = bandIntens[2][0] + bandIntens[3][0] + bandIntens[4][0];
        //console.log("bandIntens[2][0]/bvr " + bandIntens[2][0] / bvr + " bandIntens[3][0]/bvr " + bandIntens[3][0] / bvr + " bandIntens[4][0]/bvr " + bandIntens[4][0] / bvr);
        //console.log("Math.max(bandIntens[2][0]/bvr, bandIntens[3][0]/bvr, bandIntens[4][0]/bvr) " + Math.max(bandIntens[2][0] / bvr, bandIntens[3][0] / bvr, bandIntens[4][0] / bvr));
        var brightScale = 255.0 / Math.max(bandIntens[2][0] / bvr, bandIntens[3][0] / bvr, bandIntens[4][0] / bvr);
        // *Raw* Vega: r g b 183 160 255
        //now down above: var rgbVega = [183.0 / 255.0, 160.0 / 255.0, 255.0 / 255.0];
        //console.log("brightScale " + brightScale);
        //console.log("bandIntens " + bandIntens[2][0] + " " + bandIntens[3][0] + " " + bandIntens[4][0] + " bvr " + bvr);
        for (var i = numThetas - 1; i >= 0; i--) {

//  for (var i = numThetas2 - 1; i >= 0; i--) {

            ii = 1.0 * i;
            //     iCosThetaI = limbTheta1 - ii * limbDelta;
            //     iIntMaxI = interpol(iCosTheta, iIntMax, iCosThetaI);

            //numPrint(i, 50, 100 + i * 20, zeroInt, zeroInt, zeroInt, masterId);
            // LTE Eddington-Barbier limb darkening: I(Tau=0, cos(theta)=t) = B(T(Tau=t))
            var cosFctr = cosTheta[1][i];
            //  var cosFctr = iCosThetaI;
            //numPrint(cosFctr, 100, 100+i*20, zeroInt, zeroInt, zeroInt, masterId);
            var dpthIndx = tauPoint(numDeps, tauRos, cosFctr);
            //numPrint(dpthIndx, 100, 100+i*20, zeroInt, zeroInt, zeroInt, masterId);

            // limb darkening intensity factor:
            // no longer needed //var dark = (intens[iLamMax][i] / intens[iLamMax][0]);
            //var dark = iIntMaxI;

            // Un-Necessary
            //  //let's make this clear with some helper variables:
            //  //We'll try to figure out device RGB colors from BVR photometry (ie. G===V)
            //bv = intcolors[1][i];
            //vr = intcolors[2][i];
            //br = bv + vr;
            //rb = -1.0 * br;
            //rv = -1.0 * vr;
            //vb = -1.0 * bv;
//
            //// Assumes I_total = I_B + I_V + I_R:
            // help = Math.pow(10.0, rb) + Math.pow(10.0, rv) + 1.0; // I_Total/I_R
            //var r255 = Math.ceil((255.0 / help));
            //help = Math.pow(10.0, vb) + Math.pow(10.0, vr) + 1.0; // I_Total/I_G
            // var g255 = Math.ceil((255.0 / help));
            //help = Math.pow(10.0, bv) + Math.pow(10.0, br) + 1.0; // I_Total/I_B
            //var b255 = Math.ceil((255.0 / help));
            //Un-Necessary

            r255 = Math.ceil(brightScale * (bandIntens[4][i] / bvr) / rgbVega[0]); // / vegaBVR[2]);
            g255 = Math.ceil(brightScale * (bandIntens[3][i] / bvr) / rgbVega[1]); // / vegaBVR[1]);
            b255 = Math.ceil(brightScale * (bandIntens[2][i] / bvr) / rgbVega[2]); // / vegaBVR[0]);
            //console.log("i " + i + " r g b " + r255 + " " + g255 + " " + b255);
            //console.log("i " + i + " rr " + (bandIntens[4][i] / bvr) / vegaBVR[2] +
            //        " gg " + (bandIntens[3][i] / bvr) / vegaBVR[1] +
            //       " bb " + (bandIntens[2][i] / bvr) / vegaBVR[0]);
            //console.log("i " + i + " rr " + (bandIntens[4][i]) +
            //        " gg " + (bandIntens[3][i]) +
            //        " bb " + (bandIntens[2][i]));

            var xTickPos = xRange * (logE * tauRos[1][dpthIndx] - minXData) / rangeXData; // pixels   

            // horizontal position in pixels - data values increase rightward:
            var xShift = xOffset + xTickPos;
            ////stringify and add unit:
            //        var xShiftStr = numToPxStrng(xShift);

            var yTickPos = yRange * (temp[0][dpthIndx] - minYData) / rangeYData;
            // vertical position in pixels - data values increase upward:
            var yShift = xLowerYOffset - yTickPos;
            ////stringify and add unit:
            //       var yShiftStr = numToPxStrng(yShift);

            plotPnt(xShift, yShift, r255, g255, b255, opac, dSize, plotTwoId);
        }

// legend using dot of last color in loop directly above:
        var titleYPos = xLowerYOffset - 1.25 * yRange;
        var titleXPos = 1.02 * xOffset;
        plotPnt(titleXPos, titleYPos + 10, r255, g255, b255, opac, dSize, plotTwoId);
        plotPnt(titleXPos + 10, titleYPos + 10, 0.1 * r255, 0.1 * g255, 0.1 * b255, opac, dSize, plotTwoId);
        //txtPrint("<span title='Limb darkening depths of &#964_Ros(&#952) = 1'>&#964<sub>Ros</sub>(0 < &#952 < 90<sup>o</sup>) = 1</span>",
        //        titleXPos + 20, titleYPos - 5, zeroInt, zeroInt, zeroInt, masterId);
        txtPrint("<span title='Limb darkening depths of &#964_Ros(&#952) = 1'><em>&#964</em><sub>Ros</sub>(0 < <em>&#952</em> < 90<sup>o</sup>) = 1</span>",
                titleXPos + 20, titleYPos - 5, zeroInt, zeroInt, zeroInt, plotTwoId);
    }
    //
    //
    //  *****   PLOT THREE / PLOT 3
    //
    //
    // Plot three: log(Tau) vs log(Pressure)

    if ((ifLineOnly === false) && (ifShowAtmos === true)) {

        //console.log("PLOT THREE");
        //   var plotRow = 1;
        //   var plotCol = 0;
        var plotRow = 2;
        var plotCol = 2;
        //var numXTicks = 6;
        var minXData = logE * tauRos[1][0];
        var maxXData = logE * tauRos[1][numDeps - 1];
        var xAxisName = "<span title='Rosseland mean optical depth'><a href='http://en.wikipedia.org/wiki/Optical_depth_%28astrophysics%29' target='_blank'>Log<sub>10</sub> <em>&#964</em><sub>Ros</sub></a></span>";
        // From Hydrostat.hydrostat:
        //press is a 4 x numDeps array:
        // rows 0 & 1 are linear and log *gas* pressure, respectively
        // rows 2 & 3 are linear and log *radiation* pressure
        // Don't use upper boundary condition as lower y-limit - use a couple of points below surface:
        //var numYTicks = 6;
        // Build total P from P_Gas & P_Rad:
        var logPTot = [];
        logPTot.length = numDeps;
        for (var i = 0; i < numDeps; i++) {
            logPTot[i] = Math.log(press[0][i] + press[2][i]);
            //console.log(logPTot[i]);
        }
        //var minYData = logE * logPTot[0] - 2.0; // Avoid upper boundary condition [i]=0
        var minYData = logE * Math.min(press[1][0], press[3][0]) - 3.0;
        var maxYData = logE * logPTot[numDeps - 1];
        var yAxisName = "Log<sub>10</sub> <em>P</em> <br />(dynes <br />cm<sup>-2</sup>)";
        //washer(xRange, xOffset, yRange, yOffset, wColor, plotThreeId);

        var xAxisParams = XAxis(plotRow, plotCol,
                minXData, maxXData, xAxisName,
                plotThreeId);
        var yAxisParams = YAxis(plotRow, plotCol,
                minYData, maxYData, yAxisName,
                plotThreeId);
        xOffset = xAxisParams[0];
        yOffset = xAxisParams[4];
        var rangeXData = xAxisParams[1];
        var deltaXData = xAxisParams[2];
        var deltaXPxl = xAxisParams[3];
        var rangeYData = yAxisParams[1];
        var deltaYData = yAxisParams[2];
        var deltaYPxl = yAxisParams[3];
        var xLowerYOffset = xAxisParams[5];
        minXData = xAxisParams[6]; //updated value
        minYData = yAxisParams[6]; //updated value
        maxXData = xAxisParams[7]; //updated value
        maxYData = yAxisParams[7]; //updated value        
        //
        var legendYPos = xLowerYOffset - 1.05 * yRange;
        var legendXPos = 1.1 * xOffset;
        txtPrint("log Pressure: <span style='color:blue' title='Total pressure'><strong><em>P</em><sub>Tot</sub></strong></span> "
                + " <a href='http://en.wikipedia.org/wiki/Gas_laws' target='_blank'><span style='color:#00FF88' title='Gas pressure'><em>P</em><sub>Gas</sub></span></a> "
                + " <a href='http://en.wikipedia.org/wiki/Radiation_pressure' target='_blank'><span style='color:red' title='Radiation pressure'><em>P</em><sub>Rad</sub></span></a>",
                legendXPos - 20, legendYPos - 20, zeroInt, zeroInt, zeroInt, plotThreeId);
        //txtPrint(" <a href='http://en.wikipedia.org/wiki/Gas_laws' target='_blank'><span title='Gas pressure'><em>P</em><sub>Gas</sub></span></a> ",
        //        legendXPos + 140, legendYPos - 20, 0, 255, 0, masterId);

        //Data loop - plot the result!

        var dSize = 6.0; //plot point size
        var dSizeG = 4.0;
        var opac = 1.0; //opacity
        // RGB color
        // PTot:
        var r255 = 0;
        var g255 = 0;
        var b255 = 255; //blue 
        // PGas:
        var r255G = 0;
        var g255G = 255;
        var b255G = 100; //green
        // PRad:
        var r255R = 255;
        var g255R = 0;
        var b255R = 0; //red

        var ii;
        // Avoid upper boundary at i=0
        for (var i = 1; i < numDeps; i++) {

            ii = 1.0 * i;
            var xTickPos = xRange * (logE * tauRos[1][i] - minXData) / rangeXData; // pixels   

            // horizontal position in pixels - data values increase rightward:
            var xShift = xOffset + xTickPos;
            ////stringify and add unit:
            //        var xShiftStr = numToPxStrng(xShift);

            var yTickPos = yRange * (logE * logPTot[i] - minYData) / rangeYData;
            var yTickPosG = yRange * (logE * press[1][i] - minYData) / rangeYData;
            var yTickPosR = yRange * (logE * press[3][i] - minYData) / rangeYData;
            // vertical position in pixels - data values increase upward:
            var yShift = xLowerYOffset - yTickPos;
            var yShiftG = xLowerYOffset - yTickPosG;
            var yShiftR = xLowerYOffset - yTickPosR;
            ////stringify and add unit:
            //       var yShiftStr = numToPxStrng(yShift);

            plotPnt(xShift, yShift, r255, g255, b255, opac, dSize, plotThreeId);
            plotPnt(xShift, yShiftG, r255G, g255G, b255G, opac, dSizeG, plotThreeId);
            plotPnt(xShift, yShiftR, r255R, g255R, b255R, opac, dSizeG, plotThreeId);
        }

// Tau=1 cross-hair

        var tTau1 = tauPoint(numDeps, tauRos, 1.0);
        var barWidth = 1.0;
        var barColor = "#777777";
        yFinesse = 0.0;
        xShift = YBar(plotRow, plotCol,
                logE * tauRos[1][tTau1], minXData, maxXData, barWidth, yRange,
                yFinesse, barColor, plotThreeId);
        //console.log("Bar: xShift = " + xShift);

        //console.log("PLOT THREE: logE*logPTot[tTau1] " + logE * logPTot[tTau1]);
        yShift = XBar(plotRow, plotCol,
                logE * logPTot[tTau1], minYData, maxYData,
                barColor, plotThreeId);
        txtPrint("<span style='font-size:small; color:#444444'><em>&#964</em><sub>Ros</sub>=1</span>",
                xShift + 10, yShift - 50, zeroInt, zeroInt, zeroInt, plotThreeId);
    }
    //
    //
    //  *****   PLOT FOUR / PLOT 4
    //
    //
    // Plot four: Limb darkening

    if ((ifLineOnly === false) && (ifShowRad === true)) {

        //console.log("PLOT FOUR");
        //   var plotRow = 1;
        //   var plotCol = 1;
        var plotRow = 3;
        var plotCol = 1;
        //var numXTicks = 9;
        var minXData = 180.0 * Math.acos(cosTheta[1][0]) / Math.PI;
        var maxXData = 180.0 * Math.acos(cosTheta[1][numThetas - 1]) / Math.PI;
        var xAxisName = "<em>&#952</em> (<sup>o</sup>)";
        //var numYTicks = 4;
        var minYData = 0.0;
        var maxYData = 1.0;
        var yAxisName = "<span title='Monochromatic surface specific intensity'><a href='http://en.wikipedia.org/wiki/Specific_radiative_intensity' target='_blank'><em>I</em><sub>&#955</sub>(<em>&#952</em>)/<br /><em>I</em><sub>&#955</sub>(0)</a></span>";
        //washer(xRange, xOffset, yRange, yOffset, wColor, plotFourId);

        //console.log("Calling: minXData " + minXData + " maxXData " + maxXData + " minYData " + minYData + " maxYData " + maxYData);
        var xAxisParams = XAxis(plotRow, plotCol,
                minXData, maxXData, xAxisName,
                plotFourId);
        var yAxisParams = YAxis(plotRow, plotCol,
                minYData, maxYData, yAxisName,
                plotFourId);
        xOffset = xAxisParams[0];
        yOffset = xAxisParams[4];
        var rangeXData = xAxisParams[1];
        var deltaXData = xAxisParams[2];
        var deltaXPxl = xAxisParams[3];
        var rangeYData = yAxisParams[1];
        var deltaYData = yAxisParams[2];
        var deltaYPxl = yAxisParams[3];
        var xLowerYOffset = xAxisParams[5];
        minXData = xAxisParams[6]; //updated value
        minYData = yAxisParams[6]; //updated value
        maxXData = xAxisParams[7]; //updated value
        maxYData = yAxisParams[7]; //updated value        
        //
        // Add legend annotation:

        var legendYPos = xLowerYOffset - 0.35 * yRange;
        var legendXPos = 1.02 * xOffset;
        //var iLamMinMax = minMax2(masterFlux);
        //var iLamMax = iLamMinMax[1];
        //var lamMax = (1.0e7 * masterLams[iLamMax]).toPrecision(3);

        var lam1 = (1.0e7 * masterLams[0]).toPrecision(3);
        var lam1Str = lam1.toString(10);
        var lamN = (1.0e7 * masterLams[numMaster - 1]).toPrecision(3);
        var lamNStr = lamN.toString(10);
        var lam0r = (1.0e7 * lam0).toPrecision(3);
        var lam0rStr = lam0r.toString(10);
        txtPrint("<span style='font-size:small'><span style='color:#00FF88'><em>&#955</em><sub>Max</sub> = " + lamMaxStr + "nm</span><br /> "
                + " <span style='color:blue'><em>&#955</em> = " + lam1Str + "nm</span><br /> "
                + " <span style='color:red'><em>&#955</em> = " + lamNStr + "nm</span><br />"
                + " <span style='color:#444444'>line <em>&#955</em><sub>0</sub> = " + lam0rStr + "nm</span></span>",
                legendXPos, legendYPos, zeroInt, zeroInt, zeroInt, plotFourId);
        // Add title annotation:


        var titleYPos = xLowerYOffset - 1.15 * yRange;
        var titleXPos = 1.02 * xOffset;
        txtPrint("<span style='font-size:normal; color:blue'><a href='http://en.wikipedia.org/wiki/Limb_darkening' target='_blank'>Limb darkening and reddening</a></span>",
                titleXPos, titleYPos, zeroInt, zeroInt, zeroInt, plotFourId);
        //Data loop - plot the result!

        var dSize = 4.0; //plot point size
        var dSize0 = 3.0;
        var opac = 1.0; //opacity
        // RGB color
        // PTot:
        var r255 = 0;
        var g255 = 255;
        var b255 = 100; //green 
        // PGas:
        var r2550 = 0;
        var g2550 = 0;
        var b2550 = 255; //blue
        // PRad:
        var r255N = 255;
        var g255N = 0;
        var b255N = 0; //red


        //console.log("yRange " + yRange + " lineIntens[keyLambds[0]][0] " + lineIntens[keyLambds[0]][0]);
        //console.log("keyLambds[0] " + keyLambds[0] + " lineLambdas[keyLambds[0]] " + 1.0e7*lineLambdas[keyLambds[0]]);

        var xTickPos = xRange * (180.0 * Math.acos(cosTheta[1][0]) / Math.PI - minXData) / rangeXData; // pixels   
        // horizontal position in pixels - data values increase rightward:
        var lastXShift = xOffset + xTickPos;
        var yTickPos = yRange * ((masterIntens[iLamMax][0] / masterIntens[iLamMax][0]) - minYData) / rangeYData;
        var yTickPos0 = yRange * ((masterIntens[0][0] / masterIntens[0][0]) - minYData) / rangeYData;
        var yTickPosN = yRange * ((masterIntens[numMaster - 1][0] / masterIntens[numMaster - 1][0]) - minYData) / rangeYData;
        var yTickPosLn = yRange * ((lineIntens[keyLambds[0]][0] / lineIntens[keyLambds[0]][0]) - minYData) / rangeYData;
        //console.log("i " + i + " yTickPos " + yTickPos + " yTickPosLn " + yTickPosLn);
        //console.log("lineIntens[keyLambds[0]][i] / lineIntens[keyLambds[0]][0] " + lineIntens[keyLambds[0]][i] / lineIntens[keyLambds[0]][0]);
        //console.log("masterIntens[iLamMax][i] / masterIntens[iLamMax][0] " + masterIntens[iLamMax][i] / masterIntens[iLamMax][0]);

        // vertical position in pixels - data values increase upward:
        var lastYShift = xLowerYOffset - yTickPos;
        var lastYShift0 = xLowerYOffset - yTickPos0;
        var lastYShiftN = xLowerYOffset - yTickPosN;
        var lastYShiftLn = xLowerYOffset - yTickPosLn;
        for (var i = 1; i < numThetas; i++) {

            xTickPos = xRange * (180.0 * Math.acos(cosTheta[1][i]) / Math.PI - minXData) / rangeXData; // pixels   
            //var xTickPos = xRange * (180.0 * Math.acos(iCosThetaI) / Math.PI - minXData) / rangeXData; // pixels   
            // horizontal position in pixels - data values increase rightward:
            var xShift = xOffset + xTickPos;
            ////stringify and add unit:
            //        var xShiftStr = numToPxStrng(xShift);

            yTickPos = yRange * ((masterIntens[iLamMax][i] / masterIntens[iLamMax][0]) - minYData) / rangeYData;
            yTickPos0 = yRange * ((masterIntens[0][i] / masterIntens[0][0]) - minYData) / rangeYData;
            yTickPosN = yRange * ((masterIntens[numMaster - 1][i] / masterIntens[numMaster - 1][0]) - minYData) / rangeYData;
            yTickPosLn = yRange * ((lineIntens[keyLambds[0]][i] / lineIntens[keyLambds[0]][0]) - minYData) / rangeYData;
            //console.log("i " + i + " yTickPos " + yTickPos + " yTickPosLn " + yTickPosLn);
            //console.log("lineIntens[keyLambds[0]][i] / lineIntens[keyLambds[0]][0] " + lineIntens[keyLambds[0]][i] / lineIntens[keyLambds[0]][0]);
            //console.log("masterIntens[iLamMax][i] / masterIntens[iLamMax][0] " + masterIntens[iLamMax][i] / masterIntens[iLamMax][0]);

            // vertical position in pixels - data values increase upward:
            var yShift = xLowerYOffset - yTickPos;
            var yShift0 = xLowerYOffset - yTickPos0;
            var yShiftN = xLowerYOffset - yTickPosN;
            var yShiftLn = xLowerYOffset - yTickPosLn;
            ////stringify and add unit:
            //       var yShiftStr = numToPxStrng(yShift);

            plotPnt(xShift, yShift, r255, g255, b255, opac, dSize, plotFourId);
            plotPnt(xShift, yShift0, r2550, g2550, b2550, opac, dSize0, plotFourId);
            plotPnt(xShift, yShiftN, r255N, g255N, b255N, opac, dSize0, plotFourId);
            plotPnt(xShift, yShiftLn, 100, 100, 100, opac, dSize0, plotFourId); //gray
            //plotLin(lastXShift, lastYShift, xShift, yShift, r255, g255, b255, opac, dSize, plotFourId);
            //plotLin(lastXShift, lastYShift0, xShift, yShift0, r2550, g2550, b2550, opac, dSize0, plotFourId);
            //plotLin(lastXShift, lastYShiftN, xShift, yShiftN, r255N, g255N, b255N, opac, dSize0, plotFourId);
            //plotLin(lastXShift, lastYShiftLn, xShift, yShiftLn, 100, 100, 100, opac, dSize0, plotFourId); //gray

            lastXShift = xShift;
            lastYShift = yShift;
            lastYShift0 = yShift0;
            lastYShiftN = yShiftN;
            lastYShiftLn = yShiftLn;
        }
    }

//
//
//  *****   PLOT FIVE / PLOT 5
//
//
// Plot five: SED

    if ((ifLineOnly === false) && (ifShowRad === true)) {

        //console.log("PLOT FIVE");
//    var plotRow = 2;
//    var plotCol = 0;
        var plotRow = 2;
        var plotCol = 1;
        //var numXTicks = 5;
        var minXData = 1.0e7 * masterLams[0];
        var maxXData = 1.0e7 * masterLams[numMaster - 1];
        var xAxisName = "<em>&#955</em> (nm)";
        //    ////Logarithmic x:
        //var minXData = 7.0 + logTen(masterLams[0]);
        //var maxXData = 7.0 + logTen(masterLams[numMaster - 1]);
        //var maxXData = 3.0; //finesse - Log10(lambda) = 3.5 nm
        //var xAxisName = "Log<sub>10</sub> &#955 (nm)";
        //var numYTicks = 4;
        //now done above var norm = 1.0e15; // y-axis normalization
        var minYData = 0.0;
        // iLamMax established in PLOT TWO above:
        var maxYData = masterFlux[0][iLamMax] / norm;
        //console.log("In: minYData " + minYData + " maxYData " + maxYData);
        var yAxisName = "<span title='Monochromatic surface flux'><a href='http://en.wikipedia.org/wiki/Spectral_flux_density' target='_blank'> <em>F</em><sub>&#955</sub> x 10<sup>15</sup><br />ergs s<sup>-1</sup> <br />cm<sup>-3</sup></a></span>";
        ////Logarithmic y:
        //var minYData = 12.0;
        //var maxYData = logE * masterFlux[1][iLamMax];
        //var yAxisName = "<span title='Monochromatic surface flux'><a href='http://en.wikipedia.org/wiki/Spectral_flux_density' target='_blank'>Log<sub>10</sub> <em>F</em><sub>&#955</sub> <br /> ergs s<sup>-1</sup> cm<sup>-3</sup></a></span>";
        //(xRange, xOffset, yRange, yOffset, wColor, plotFiveId);

        var xAxisParams = XAxis(plotRow, plotCol,
                minXData, maxXData, xAxisName,
                plotFiveId);
        //console.log("minYData " + minYData + " maxYData " + maxYData);

        var yAxisParams = YAxis(plotRow, plotCol,
                minYData, maxYData, yAxisName,
                plotFiveId);
        xOffset = xAxisParams[0];
        yOffset = xAxisParams[4];
        var rangeXData = xAxisParams[1];
        var deltaXData = xAxisParams[2];
        var deltaXPxl = xAxisParams[3];
        var rangeYData = yAxisParams[1];
        var deltaYData = yAxisParams[2];
        var deltaYPxl = yAxisParams[3];
        var xLowerYOffset = xAxisParams[5];
        minXData = xAxisParams[6]; //updated value
        minYData = yAxisParams[6]; //updated value
        maxXData = xAxisParams[7]; //updated value
        maxYData = yAxisParams[7]; //updated value        
        //console.log("Out: minYData " + minYData + " maxYData " + maxYData);
        //
        // Add legend annotation:


        var legendYPos = xLowerYOffset - 1.2 * yRange;
        var legendXPos = 1.05 * xOffset;
        var thet0 = 180.0 * Math.acos(cosTheta[1][0]) / Math.PI;
        var thet0lbl = thet0.toPrecision(2);
        var thet0Str = thet0lbl.toString();
        var thetN = 180.0 * Math.acos(cosTheta[1][numThetas - 2]) / Math.PI;
        var thetNlbl = thetN.toPrecision(2);
        var thetNStr = thetNlbl.toString();
        txtPrint("<span style='font-size:small'>"
                + "<span><em>F</em><sub>&#955</sub> (<em>&#955</em><sub>Max</sub> = " + lamMaxStr + " nm)</span>, "
                + " <span><em>I</em><sub>&#955</sub>,</span> <span style='color:#444444'> <em>&#952</em> = " + thet0Str + "<sup>o</sup></span>,  "
                + " <span style='color:#444444'><em>&#952</em> = " + thetNStr + "<sup>o</sup></span></span>",
                legendXPos, legendYPos + 10, zeroInt, zeroInt, zeroInt, plotFiveId);
        var titleYPos = xLowerYOffset - 1.15 * yRange;
        var titleXPos = 1.02 * xOffset;
        txtPrint("<span style='font-size:normal; color:blue'><a href='http://en.wikipedia.org/wiki/Spectral_energy_distribution' target='_blank'>\n\
     Spectral energy distribution (SED)</a></span>",
                titleXPos, titleYPos - 25, zeroInt, zeroInt, zeroInt, plotFiveId);
        // Photometric bands centers


        var opac = 0.5;
        var opacStr = numToPxStrng(opac);
        var yTickPos = 0;
        var yShift = (xLowerYOffset - yRange) + yTickPos;
        var yShiftStr = numToPxStrng(yShift);
        var vBarWidth = 2; //pixels 
        var vBarHeight = yRange;
        var vBarWidthStr = numToPxStrng(vBarWidth);
        var vBarHeightStr = numToPxStrng(vBarHeight);
        //
        var UBVRIBands = function(r255, g255, b255, band0) {

            var RGBHex = colHex(r255, g255, b255);
            // Vertical bar:
            var xTickPos = xRange * (band0 - minXData) / rangeXData; // pixels    
            var xShift = xOffset + xTickPos;
            var xShiftStr = numToPxStrng(xShift);
            var vCrossId = document.createElement("div");
            vCrossId.class = "cross";
            vCrossId.style.position = "absolute";
            vCrossId.style.display = "block";
            vCrossId.style.height = vBarHeightStr;
            vCrossId.style.width = vBarWidthStr;
            //hCrossId.style.borderRadius = "100%";
            vCrossId.style.opacity = opacStr;
            vCrossId.style.backgroundColor = RGBHex;
            vCrossId.style.marginLeft = xShiftStr;
            vCrossId.style.marginTop = yShiftStr;
            //Append the dot to the plot
            plotFiveId.appendChild(vCrossId);
        }; //end function UBVRIbands
        //
        var filters = filterSet();
        var lam0_ptr = 11; // approximate band centre
        var numBands = filters.length;
        var lamUBVRI = [];
        lamUBVRI.length = numBands;
        for (var ib = 0; ib < numBands; ib++) {
            lamUBVRI[ib] = 1.0e7 * filters[ib][0][lam0_ptr]; //linear lambda
            //lamUBVRI[ib] = 7.0 + logTen(filters[ib][0][lam0_ptr]);  //logarithmic lambda
        }

//Ux:
        var r255 = 155;
        var g255 = 0;
        var b255 = 155; // violet

        UBVRIBands(r255, g255, b255, lamUBVRI[0]);
        //B:
        var r255 = 0;
        var g255 = 0;
        var b255 = 255; // blue
        UBVRIBands(r255, g255, b255, lamUBVRI[2]);
        //V:
        var r255 = 0;
        var g255 = 255;
        var b255 = 100; // green
        UBVRIBands(r255, g255, b255, lamUBVRI[3]);
        //R:
        var r255 = 255;
        var g255 = 0;
        var b255 = 0; // red
        UBVRIBands(r255, g255, b255, lamUBVRI[4]);
        //I:
        var r255 = 255;
        var g255 = 40;
        var b255 = 40; // dark red / brown ??
        UBVRIBands(r255, g255, b255, lamUBVRI[5]);
        //Data loop - plot the result!

        //var dSize = 4.0; //plot point size
        //var dSize0 = 4.0;
        var dSize = 3.0; //plot point size
        var dSize0 = 2.0;
        var opac = 1.0; //opacity
        // RGB color
        // PTot:
        var r255 = 0;
        var g255 = 0;
        var b255 = 0; //black
        // PGas:
        var r2550 = 90;
        var g2550 = 90;
        var b2550 = 90; //dark gray
        // PRad:
        var r255N = 120;
        var g255N = 120;
        var b255N = 120; //light gray

        // Avoid upper boundary at i=0

        //var logLambdanm = 7.0 + logTen(masterLams[0]);  //logarithmic
        //var xTickPos = xRange * (logLambdanm - minXData) / rangeXData; // pixels  //logarithmic
        var lambdanm = 1.0e7 * masterLams[0];
        var xTickPos = xRange * (lambdanm - minXData) / rangeXData; // pixels
        var lastXShift = xOffset + xTickPos;
//Logarithmic y:
        //var yTickPos = yRange * (logE * masterFlux[1][0] - minYData) / rangeYData;
        //var yTickPos0 = yRange * (logTen(masterIntens[0][0]) - minYData) / rangeYData;
        //var yTickPosN = yRange * (logTen(masterIntens[0][numThetas - 2]) - minYData) / rangeYData;
        var yTickPos = yRange * ((masterFlux[0][0] / norm) - minYData) / rangeYData;
        var yTickPos0 = yRange * ((masterIntens[0][0] / norm) - minYData) / rangeYData;
        var yTickPosN = yRange * ((masterIntens[0][numThetas - 2] / norm) - minYData) / rangeYData;
        // vertical position in pixels - data values increase upward:
        var lastYShift = xLowerYOffset - yTickPos;
        var lastYShift0 = xLowerYOffset - yTickPos0;
        var lastYShiftN = xLowerYOffset - yTickPosN;
        var xShift, yShift;
        for (var i = 1; i < numMaster; i++) {

            lambdanm = masterLams[i] * 1.0e7; //cm to nm //linear
            //logLambdanm = 7.0 + logTen(masterLams[i]);  //logarithmic
            ii = 1.0 * i;
            //xTickPos = xRange * (logLambdanm - minXData) / rangeXData; // pixels   //logarithmic
            xTickPos = xRange * (lambdanm - minXData) / rangeXData; // pixels   //linear

            // horizontal position in pixels - data values increase rightward:
            xShift = xOffset + xTickPos;
            ////stringify and add unit:
            //        var xShiftStr = numToPxStrng(xShift);

//logarithmic y:
            //yTickPos = yRange * (logE * masterFlux[1][i] - minYData) / rangeYData;
            //yTickPos0 = yRange * (logTen(masterIntens[i][0]) - minYData) / rangeYData;
            //yTickPosN = yRange * (logTen(masterIntens[i][numThetas - 2]) - minYData) / rangeYData;
            yTickPos = yRange * ((masterFlux[0][i] / norm) - minYData) / rangeYData;
            yTickPos0 = yRange * ((masterIntens[i][0] / norm) - minYData) / rangeYData;
            yTickPosN = yRange * ((masterIntens[i][numThetas - 2] / norm) - minYData) / rangeYData;
            // vertical position in pixels - data values increase upward:
            yShift = xLowerYOffset - yTickPos;
            yShift0 = xLowerYOffset - yTickPos0;
            yShiftN = xLowerYOffset - yTickPosN;
            ////stringify and add unit:
            //       var yShiftStr = numToPxStrng(yShift);

            plotPnt(xShift, yShift, r255, g255, b255, opac, dSize, plotFiveId);
            plotPnt(xShift, yShift0, r2550, g2550, b2550, opac, dSize0, plotFiveId);
            plotPnt(xShift, yShiftN, r255N, g255N, b255N, opac, dSize0, plotFiveId);
            //plotLin(lastXShift, lastYShift, xShift, yShift, r255, g255, b255, opac, dSize, plotFiveId);
            //plotLin(lastXShift, lastYShift0, xShift, yShift0, r2550, g2550, b2550, opac, dSize0, plotFiveId);
            //plotLin(lastXShift, lastYShiftN, xShift, yShiftN, r255N, g255N, b255N, opac, dSize0, plotFiveId);

            lastXShift = xShift;
            lastYShift = yShift;
            lastYShift0 = yShift0;
            lastYShiftN = yShiftN;
        }
    }

//
//
//  *****   PLOT SIX / PLOT 6
//
//
// Plot six: Line profile

    if (ifShowLine === true) {
        //console.log("PLOT SIX");
//    var plotRow = 2;
        //   var plotCol = 1;
        var plotRow = 2;
        var plotCol = 0;
        //var numXTicks = 6;
        //w.r.t. line center lambda:
        //Find where line profile climbs up to 95% of continuum in red half iof line:
        var iCount = Math.floor(numPoints / 2) - 1; //initialize
        //console.log("numPoints " + numPoints + " iCount " + iCount);
        for (var il = Math.floor(numPoints / 2); il < numPoints; il++) {
//console.log("il " + il + " lineFlux[0][il]/lineFlux[0][numPoints - 1] " + lineFlux[0][il]/lineFlux[0][numPoints - 1]);
            if (lineFlux[0][il] < 0.95 * lineFlux[0][numPoints - 1]) {
//console.log("Condition triggered");
                iCount++;
            }
        }
        //console.log("iCount " + iCount);
//One to three more if we can accomodate them:
        //console.log("iCount " + iCount + " numPoints " + numPoints);
        if (iCount < numPoints - 1) {
            //console.log("First count++");
            iCount++;
        }
        //console.log("iCount " + iCount + " numPoints " + numPoints);
        if (iCount < numPoints - 1) {
            //console.log("Second count++");
            iCount++;
        }
        //console.log("iCount " + iCount + " numPoints " + numPoints);
        if (iCount < numPoints - 1) {
            //console.log("Third count++");
            iCount++;
        }
        //console.log("iCount " + iCount + " numPoints " + numPoints);

        var iStart = numPoints - iCount - 1;
        var iStop = iCount;
        //Set minimum range of x-axis to 0.1 nm:
        while ((lineLambdas[iStop] - lineLambdas[iStart]) < 1.0e-7 * 0.1) {
            iStart--;
            iStop++;
        }
        //console.log("iStart: " + iStart + " iStop: " + iStop);
////over-ride x-axis scaling while debugging:
// iStart = 0;
// iStop = numPoints-1;

//console.log("iCount " + iCount + " numPoints - iCount " + (numPoints - iCount));
//Try to scale x-range to width of line:
        var maxXData = 1.0e7 * (lineLambdas[iStop] - lam0);
        var minXData = 1.0e7 * (lineLambdas[iStart] - lam0);
        //var maxXData = 1.0e7 * lineLambdas[iStop];
        //var minXData = 1.0e7 * lineLambdas[iStart];
        //console.log("iStop " + iStop + " iStart " + iStart + " lineLambdas[iStop] " + lineLambdas[iStop] + " lineLambdas[iStart] " + lineLambdas[iStart] + " lam0 " + lam0);
        //console.log("PLOT SIX: First minXData " + minXData + " maxXData " + maxXData);
        //var minXData = 1.0e7 * (lineLambdas[0] - lam0);
        //var maxXData = 1.0e7 * (lineLambdas[numPoints - 1] - lam0);
        //absolute lambda:
//    var minXData = 1.0e7 * (lineLambdas[0]);
//    var maxXData = 1.0e7 * (lineLambdas[numPoints - 1]);
        //   
        var xAxisName = "<em>&#916</em> <em>&#955</em> (nm)";
        //var numYTicks = 6;
        //var minYData = intens[0][0];  // 
        //var maxYData = intens[numLams - 1][0];
        var minYData = 0.0;
        var maxYData = 1.0;
        var yAxisName = "<span title='Continuum normalized flux'><a href='http://en.wikipedia.org/wiki/Spectral_flux_density' target='_blank'><em>F</em><sub>&#955</sub>/<br /><em>F</em><sup>C</sup><sub>&#955 0</sub></a></span>";
        //washer(xRange, xOffset, yRange, yOffset, wColor, plotSixId);

        //console.log("XAxis from PLOT SIX:");
        var xAxisParams = XAxis(plotRow, plotCol,
                minXData, maxXData, xAxisName,
                plotSixId);
        var yAxisParams = YAxis(plotRow, plotCol,
                minYData, maxYData, yAxisName,
                plotSixId);
        xOffset = xAxisParams[0];
        yOffset = xAxisParams[4];
        var rangeXData = xAxisParams[1];
        var deltaXData = xAxisParams[2];
        var deltaXPxl = xAxisParams[3];
        var rangeYData = yAxisParams[1];
        var deltaYData = yAxisParams[2];
        var deltaYPxl = yAxisParams[3];
        var xLowerYOffset = xAxisParams[5];
        minXData = xAxisParams[6]; //updated value
        //minXData = xAxisParams[6] - 1.0e7*lam0; //updated value
        minYData = yAxisParams[6]; //updated value
        maxXData = xAxisParams[7]; //updated value
        maxYData = yAxisParams[7]; //updated value        
        //console.log("PLOT SIX: Second minXData " + minXData + " maxXData " + maxXData + " rangeXData " + rangeXData + " deltaXData " + deltaXData);
        //
        // Add legend annotation:


        var legendYPos = xLowerYOffset - 1.2 * yRange;
        var legendXPos = 1.05 * xOffset;
        var lam0lbl = (1.0e7 * lam0).toPrecision(3);
        var lam0Str = lam0lbl.toString();
        var thetN = 180.0 * Math.acos(cosTheta[1][5]) / Math.PI;
        var thetNlbl = thetN.toPrecision(5);
        var thetNStr = thetNlbl.toString();
//        txtPrint("<span style='font-size:small'><span><em>F</em><sub>&#955</sub>, &#955<sub>0</sub> = " + lam0Str + " nm</span><br /> "
//                + " <span><em>I</em><sub>&#955</sub>,</span> <span style='color:green'> &#955 = " + thet0Str + "<sup>o</sup></span>,  "
        //               + " <span style='color:red'>&#952 = " + thetNStr + "<sup>o</sup></span></span>",
        //               legendXPos, legendYPos, zeroInt, zeroInt, zeroInt, plotSixId);
        txtPrint("<span style='font-size:small'><span><em>F</em><sub>&#955</sub>, <em>&#955</em><sub>0</sub> = " + lam0Str + " nm</span><br /> ",
                // + " <span><em>I</em><sub>&#955</sub>,</span> <span style='color:green'> &#955 = " + thet0Str + "<sup>o</sup></span>,  "
                // + " <span style='color:red'>&#952 = " + thetNStr + "<sup>o</sup></span></span>",
                legendXPos, legendYPos, zeroInt, zeroInt, zeroInt, plotSixId);
        var dSize = 3.0; //plot point size
        var dSizeSym = 4.0;
        var dSize0 = 1.0;
        var opac = 1.0; //opacity
        // RGB color
        // PTot:
        var r255 = 0;
        var g255 = 0;
        var b255 = 0; //black
        // PGas:
        var r2550 = 0;
        var g2550 = 255;
        var b2550 = 100; // green
        // PRad:
        var r255N = 255;
        var g255N = 0;
        var b255N = 0; //red



        // Continuum:

        var opacc = 0.5;
        var opaccStr = numToPxStrng(opac);
        var r255c = 130;
        var g255c = 130;
        var b255c = 130; // gray
        var RGBHexc = colHex(r255c, g255c, b255c);
        // Horizontal bar:

        var one = 1.0;
        yShift = XBar(plotRow, plotCol,
                one, minYData, maxYData,
                RGBHexc, plotSixId);
        //   
        //    // Line center, lambda_0 & HWHM lambda
        //    
        //    
        //    var opac = 0.75;
        //    var opacStr = numToPxStrng(opac);
        //    
        //    var yTickPos = 0;
        //    var yShift = (xLowerYOffset - yRange) + yTickPos;
        //    var yShiftStr = numToPxStrng(yShift);
        //     
        //     var vBarWidth = 2; //pixels 
        //     var vBarHeight = yRange;
        //     var vBarWidthStr = numToPxStrng(vBarWidth);
        //    var vBarHeightStr = numToPxStrng(vBarHeight);
        //     
        //    //lambda_0 line center:
        //     var r255 = 100;
        //     var g255 = 100;
        //    var b255 = 100; // gray
        //     var RGBHex = colHex(r255, g255, b255);
        //     
        //     // Vertical bar: line center, lambda_0
        //     //var xTickPos = xRange * (lineLambdas[numPoints/2] - lam0 - minXData) / rangeXData;  // pixels    
        //     var xTickPos = xRange * (lineLambdas[keyLambds[0]] - lam0 - minXData) / rangeXData;  // pixels 
        //     //var xTickPos = xRange * (0.0 - minXData) / rangeXData;  // pixels 
        //    var xShift = xOffset + xTickPos;
        //    var xShiftStr = numToPxStrng(xShift);
        //     
        //    
        //   
        //    // Vertical bar: half-power width
        //    var xTickPos = xRange * (lineLambdas[keyLambds[1]] - lam0 - minXData) / rangeXData;  // pixels 
        ///     var xShift = xOffset + xTickPos;
        //    var xShiftStr = numToPxStrng(xShift);
        //    

        //    

        var titleYPos = xLowerYOffset - 1.15 * yRange;
        var titleXPos = 1.02 * xOffset;
        txtPrint("<span style='font-size:normal; color:blue'><a href='http://en.wikipedia.org/wiki/Spectral_line' target='_blank'>Spectral line profile </a></span>",
                titleXPos, titleYPos - 35, zeroInt, zeroInt, zeroInt, plotSixId);
        // Data loop below in here instead
// Spectrum not normalized - try this instead (redefines input parameter fluxCont):
        var fluxCont = (lineFlux[0][0] + lineFlux[0][numPoints - 1]) / 2.0;
        //Data loop - plot the result!

        // Interpolation variables:
        // CAUTION; numPoints-1st value holds the line centre monochromatic *continuum* flux for normalization: -Not any more!
        var lnFlx = [];
        //var lnInt0 = [];
        //var lnIntN = [];
        var lnLam = [];
        lnFlx.length = numPoints;
        //lnInt0.length = numPoints;
        //lnIntN.length = numPoints;
        lnLam.length = numPoints;
        var ii;
        for (var i = 0; i < numPoints; i++) {
            lnFlx[i] = lineFlux[0][i] / fluxCont;
            // lnInt0[i] = lineIntens[i][5] / lineIntens[numPoints - 1][5];
            // lnIntN[i] = lineIntens[i][numThetas - 2] / lineIntens[numPoints - 1][numThetas - 2];
            // w.r.t. line center lambda
            lnLam[i] = 1.0e7 * (lineLambdas[i] - lam0);
//// absolute lambda
////        lnLam[i] = 1.0e7 * lineLambdas[i];
//         No!
//         //logarithmic lambda:
            //        if (lineLambdas[i] != lam0) {
//         lnLam[i] = 7.0 + logTen(Math.abs(lineLambdas[i] - lam0));
            //        }
            //        if (lineLambdas[i] < lam0) {
            //        lnLam[i] = -1.0 * lnLam[i];
            //        }
            //        if (lineLambdas[i] === lam0) {
            //        lnLam[i] = -99.0;
            //        }
            //        
        }


// CAUTION; numPoints-1st value holds the line centre monochromatic *continuum* flux for normalization:
        var xTickPos = xRange * (lnLam[iStart] - minXData) / rangeXData; // pixels   
        // horizontal position in pixels - data values increase rightward:
        var lastXShift = xOffset + xTickPos;
        var yTickPos = yRange * (lnFlx[iStart] - minYData) / rangeYData;
        //var yTickPos0 = yRange * (lnInt0[i] - minYData) / rangeYData;
        //var yTickPosN = yRange * (lnIntN[i] - minYData) / rangeYData;
        // vertical position in pixels - data values increase upward:
        var lastYShift = xLowerYOffset - yTickPos;
        //var lastYShift0 = xLowerYOffset - yTickPos0;
        //var lastYShiftN = xLowerYOffset - yTickPosN;
        //Entire x-range:
        //for (var i = 0; i < numPoints; i++) {
        // SCaled to line width:
        //console.log("PLOT SIX: iStart " + iStart + " iStop " + iStop + " xRange " + xRange + " rangeXData " + rangeXData + " xOffset " + xOffset);


        for (var i = iStart; i <= iStop; i++) {

            //console.log("i " + i + " lnLam[i] " + lnLam[i] + " minXData " + minXData);
            xTickPos = xRange * (lnLam[i] - minXData) / rangeXData; // pixels  

            // horizontal position in pixels - data values increase rightward:

            var xShift = xOffset + xTickPos;
            //console.log("lnLam[i] " + lnLam[i] + " xTickPos " + xTickPos + " xShift " + xShift);
            ////stringify and add unit:
            //        var xShiftStr = numToPxStrng(xShift);
            //console.log("PLOT SIX: i " + i + " xTickPos " + xTickPos + " xShift " + xShift);

            yTickPos = yRange * (lnFlx[i] - minYData) / rangeYData;
            //yTickPos0 = yRange * (lnInt0[i] - minYData) / rangeYData;
            //yTickPosN = yRange * (lnIntN[i] - minYData) / rangeYData;
            //console.log("PLOT SIX: lnFlx[i] " + lnFlx[i] + " yTickPos " + yTickPos);
            //
            // vertical position in pixels - data values increase upward:
            var yShift = xLowerYOffset - yTickPos;
            //var yShift0 = xLowerYOffset - yTickPos0;
            //var yShiftN = xLowerYOffset - yTickPosN;
            ////stringify and add unit:
            //       var yShiftStr = numToPxStrng(yShift);

            //console.log("ifLinePlot " + ifLinePlot);
            if (ifLinePlot === true) {
//console.log("lines");
                plotLin(lastXShift, lastYShift, xShift, yShift, r255, g255, b255, opac, dSize, plotSixId);
                //plotLin(lastXShift, lastYShift0, xShift, yShift0, r2550, g2550, b2550, opac, dSize0, plotSixId);
                //  //plotLin(lastXShift, lastYShiftN, xShift, yShiftN, r255N, g255N, b255N, opac, dSize0, plotSixId);
            } else {
//console.log("dots");
                plotPnt(xShift, yShift, r255, g255, b255, opac, dSizeSym, plotSixId);
                //plotPnt(xShift, yShift0, r2550, g2550, b2550, opac, dSize0, plotSixId);
                //plotPnt(xShift, yShiftN, r255N, g255N, b255N, opac, dSize0, plotSixId);
            }

            lastXShift = xShift;
            lastYShift = yShift;
            //lastYShift0 = yShift0;
            //lastYShiftN = yShiftN;
        }
    }



//
//
//  *****   PLOT EIGHT / PLOT 8
//
//
// Plot eight - Grotrian diagram for ionization stage and excitation level selected
//
//
// Always do this line-related stuff anyway...
    var c = 2.9979249E+10; // light speed in vaccuum in cm/s
    var h = 6.62606957E-27; //Planck's constant in ergs sec
    var logC = Math.log(c);
    var logH = Math.log(h);
    var eV = 1.602176565E-12; // eV in ergs
    var logEv = Math.log(eV);
    //Log of line-center wavelength in cm
    var logLam0 = Math.log(lam0);
    // energy of b-b transition

    var logTransE = logH + logC - logLam0 - logEv; // last term converts back to cgs units

    // Energy of upper E-level of b-b transition
    var chiU = chiL + Math.exp(logTransE);
    if (ifShowLine === true) {
        //console.log("PLOT EIGHT");
        //var plotRow = 2;
        //var plotCol = 2;
        var plotRow = 3;
        var plotCol = 0;
        //var numXTicks = 6;
        // Determine which ionization stage gas the majority population and scale the axis 
        /// with that population
        // From function levelPops():
        // logNums is a 2D 3 x numDeps array of logarithmic number densities
        // Row 0: neutral stage ground state population
        // Row 1: ionized stage ground state population
        // Row 2: level population of lower level of bb transition (could be in either stage I or II!) 
        if (logNums[0][tTau1] >= logNums[1][tTau1]) {
            var maxXData = logE * logNums[0][tTau1];
            var minXData = logE * logNums[1][tTau1];
        } else {
            var maxXData = logE * logNums[1][tTau1];
            var minXData = logE * logNums[0][tTau1];
        }

        var xAxisName = "<span title='Logarithmic number density of particles in lower E-level of b-b transition at <em>&#964</em>_Ros=1'>Log<sub>10</sub> <em>N</em><sub>l</sub>(<em>&#964</em><sub>Ros</sub>=1) cm<sup>-3</sup></span>";
        //console.log("First chiU " + chiU);
        //var numYTicks = 5;
        var minYData = 0.0;
        //if (ionized) {
        //    var maxYData = chiI1 + chiU + 1.0; //eV
        //} else {
        //    var maxYData = chiI1 + 1.0;
        //}
        var maxYData = chiI2;

        var yAxisName = "<span title='Atomic excitation energy'><a href='http://en.wikipedia.org/wiki/Excited_state' target='_blank'>Excitation<br /> E</a> (<a href='http://en.wikipedia.org/wiki/Electronvolt' target='_blank'>eV</a>)</span>";
        //(xRange, xOffset, yRange, yOffset, wColor, plotEightId);

        var xAxisParams = XAxis(plotRow, plotCol,
                minXData, maxXData, xAxisName,
                plotEightId);
        var yAxisParams = YAxis(plotRow, plotCol,
                minYData, maxYData, yAxisName,
                plotEightId);
        //
        xOffset = xAxisParams[0];
        yOffset = xAxisParams[4];
        var rangeXData = xAxisParams[1];
        var deltaXData = xAxisParams[2];
        var deltaXPxl = xAxisParams[3];
        var rangeYData = yAxisParams[1];
        var deltaYData = yAxisParams[2];
        var deltaYPxl = yAxisParams[3];
        var xLowerYOffset = xAxisParams[5];
        minXData = xAxisParams[6]; //updated value
        minYData = yAxisParams[6]; //updated value
        maxXData = xAxisParams[7]; //updated value
        maxYData = yAxisParams[7]; //updated value        
        //
        // Second special "y-ticks" for lower and upper E-levels of b-b transition, and ground-state
        // ionization energy

        var yTickXOffset = xOffset - tickHeight / 2; //height and width reversed for y-ticks
        var yTickXOffsetStr = numToPxStrng(yTickXOffset);
        var yLabelXOffset = xOffset - 3 * labelHeight; //height & width reversed for y-ticks
        var yLabelXOffsetStr = numToPxStrng(yLabelXOffset);
        // From function levelPops():
        // logNums is a 2D 3 x numDeps array of logarithmic number densities
        // Row 0: neutral stage ground state population
        // Row 1: singly ionized stage ground state population
        // Row 2: level population of lower level of bb transition (could be in either stage I or II!) 
        // Row 3: level population of upper level of bb transition (could be in either stage I or II!)
        // Row 4: doubly ionized stage ground state population
        var yData = [0.0, chiI1, chiL, chiU, chiI2];
        var yRightTickValStr = ["<em>&#967</em><sub>I</sub>", "<em>&#967</em><sub>II</sub>", "<span style='color:red'><em>&#967</em><sub>l</sub></span>", "<em>&#967</em><sub>u</sub>", "<em>&#967</em><sub>III</sub>"];
        // Offset for labelling on right of plot
        var yRightLabelXOffset = yLabelXOffset + xRange;
        var yRightLabelXOffset0 = yLabelXOffset + xRange + 25;
        var yRightLabelXOffsetStr = numToPxStrng(yRightLabelXOffset);
        var yRightLabelXOffset0Str = numToPxStrng(yRightLabelXOffset0);
        // No!:
        // Pointers into logNums rows must be in order of increasing atomic E:
        //   var lPoint = []; // declaration
        //   if (ionized) {
        //      lPoint = [0, 1, 2, 3];
        //   } else {
        //       lPoint = [0, 2, 3, 1];
        //   }

        //console.log("tTau1 = " + tTau1);
        for (var i = 0; i < yData.length; i++) {

            ii = 1.0 * i;
            //var yTickVal = minYData + (ii * deltaData);
            // var yTickRound = yTickVal.toPrecision(3);
            //var yTickValStr = yTickRound.toString(10);  // Not used, for now - ??


            var yTickPos = Math.floor(yRange * (yData[i] / rangeYData));
            // vertical position in pixels - data values increase upward:
            var yShift = xLowerYOffset - yTickPos;
            //stringify and add unit:
            var yShiftStr = numToPxStrng(yShift);
            // Make the y-tick mark, Teff:


            var yTickId = document.createElement("div");
            yTickId.class = "ytick";
            yTickId.style.position = "absolute";
            yTickId.style.display = "block";
            yTickId.style.marginLeft = yTickXOffsetStr;
            yTickId.style.border = tickBorder;
            // Note that for y ticks, the height and width are reversed!:
            yTickId.style.width = xRangeStr;
            yTickId.style.height = tickWidth;
            yTickId.style.zIndex = 0;
            yTickId.style.marginTop = yShiftStr;
            //Append the tickmark to the axis element
            plotEightId.appendChild(yTickId);
            // Now over-plot with the width of the "y-tickmark" scaled by the 
            // log number density in each E-level:
            var RGBHex = colHex(255, 0, 0);
            //var xRangePops = Math.floor(xRange * (logE*logNums[lPoint[i]][tTau1] / maxXData));
            var xRangePops = Math.floor(xRange * (logE * logNums[i][tTau1] / maxXData));
            var xRangePopsStr = numToPxStrng(xRangePops);
            var tickWidthPops = "3px";
            var yTickId = document.createElement("div");
            yTickId.class = "ytick";
            yTickId.style.position = "absolute";
            yTickId.style.display = "block";
            yTickId.style.marginLeft = yTickXOffsetStr;
            yTickId.style.border = tickBorder;
            // Note that for y ticks, the height and width are reversed!:
            yTickId.style.width = xRangePopsStr;
            yTickId.style.height = tickWidthPops;
            yTickId.style.zIndex = 0;
            yTickId.style.backgroundColor = RGBHex;
            yTickId.style.marginTop = yShiftStr;
            //Append the tickmark to the axis element
            plotEightId.appendChild(yTickId);
            //Make the y-tick label:

            var yLabelId = document.createElement("div");
            yLabelId.class = "ylabel";
            yLabelId.style.position = "absolute";
            yLabelId.style.display = "block";
            if (i === 0) {
                yLabelId.style.marginLeft = yRightLabelXOffset0Str;
            } else {
                yLabelId.style.marginLeft = yRightLabelXOffsetStr;
            }
//    yLabelId.style.border = tickBorder; 
            yLabelId.style.marginTop = yShiftStr;
            // height and width are reversed for y labels
            yLabelId.style.width = labelHeightStr;
            yLabelId.style.height = labelWidth;
            yLabelId.style.zIndex = 0;
            //Insert the value of the tick mark: 
            yLabelId.innerHTML = "<span style='font-size:small'>" + yRightTickValStr[i] + "</span>";
            //Append the tick label to the axis element
            plotEightId.appendChild(yLabelId);
        }  // end y-tickmark loop, i

// Add ionization stage labels:

        txtPrint("<span title='Singly ionized stage'>II</span>", xOffset + xRange - 15, xLowerYOffset - yRange, zeroInt, zeroInt, zeroInt, plotEightId);
        txtPrint("<span title='Neutral stage'>I</span>", xOffset + xRange - 15, xLowerYOffset - yRange / 2, zeroInt, zeroInt, zeroInt, plotEightId);
        // Transition:

        var opac = 1.0;
        var opacStr = numToPxStrng(opac);
        var r255 = 0;
        var g255 = 100;
        var b255 = 255; // gray
        var RGBHex = colHex(r255, g255, b255);
        // Vertical bar:
        var vBarHeight = yRange * (chiU - chiL) / rangeYData;
        var xTickPos = xRange / 3; // pixels
        var yTickPos = Math.floor(yRange * ((rangeYData - chiL) / rangeYData)) - vBarHeight;
        var xShift = xOffset + xTickPos;
        var xShiftStr = numToPxStrng(xShift);
        var yShift = (xLowerYOffset - yRange) + yTickPos;
        var yShiftStr = numToPxStrng(yShift);
        var vBarWidth = 3; //pixels 

        var vBarWidthStr = numToPxStrng(vBarWidth);
        var vBarHeightStr = numToPxStrng(vBarHeight);
        var vCrossId = document.createElement("div");
        vCrossId.class = "cross";
        vCrossId.style.position = "absolute";
        vCrossId.style.display = "block";
        vCrossId.style.height = vBarHeightStr;
        vCrossId.style.width = vBarWidthStr;
        //hCrossId.style.borderRadius = "100%";
        vCrossId.style.opacity = opacStr;
        vCrossId.style.backgroundColor = RGBHex;
        vCrossId.style.marginLeft = xShiftStr;
        vCrossId.style.marginTop = yShiftStr;
        //Append the dot to the plot
        plotEightId.appendChild(vCrossId);
        // Add title annotation:


        var titleYPos = xLowerYOffset - 1.15 * yRange;
        var titleXPos = 1.02 * xOffset;
        txtPrint("<span style='font-size:normal; color:blue'><a href='http://en.wikipedia.org/wiki/Grotrian_diagram' target='_blank'>Grotrian diagram</a></span>",
                titleXPos, titleYPos, zeroInt, zeroInt, zeroInt, plotEightId);
    }

// Detailed model output section:

//    
// Set up the canvas:
//

    // **********  Basic canvas parameters: These are numbers in px - needed for calculations:
    // All plots and other output must fit within this region to be white-washed between runs

    var xRangeT = 1750;
    var yRangeT = 10000;
    var xOffsetT = 10;
    var yOffsetT = 1500;
    var charToPxT = 4; // width of typical character font in pixels - CAUTION: finesse!

    var zeroInt = 0;
    //these are the corresponding strings ready to be assigned to HTML style attributes


    var xRangeTStr = numToPxStrng(xRangeT);
    var yRangeTStr = numToPxStrng(yRangeT);
    var xOffsetTStr = numToPxStrng(xOffsetT);
    var yOffsetTStr = numToPxStrng(yOffsetT);
    // Very first thing on each load: White-wash the canvas!!

    var washTId = document.createElement("div");
    var washTWidth = xRangeT + xOffsetT;
    var washTHeight = yRangeT + yOffsetT;
    var washTTop = yOffsetT;
    var washTWidthStr = numToPxStrng(washTWidth);
    var washTHeightStr = numToPxStrng(washTHeight);
    var washTTopStr = numToPxStrng(washTTop);
    washTId.id = "washT";
    washTId.style.position = "absolute";
    washTId.style.width = washTWidthStr;
    washTId.style.height = washTHeightStr;
    washTId.style.marginTop = washTTopStr;
    washTId.style.marginLeft = "0px";
    washTId.style.opacity = 1.0;
    washTId.style.backgroundColor = "#FFFFFF";
    //washId.style.zIndex = -1;
    washTId.style.zIndex = 0;
    //washTId.style.border = "2px blue solid";

    //Wash the canvas:
    printModelId.appendChild(washTId);
    // R & L_Bol:
    var colr = 0;
    var lineHeight = 17;
    var value;
    var vOffset = 60;
    if (ifPrintAtmos == true) {

        txtPrint("Vertical atmospheric structure", 10, yOffsetT, 0, 0, 0, printModelId);
        //Column headings:

        var xTab = 190;
        txtPrint("i", 10, yOffsetT + lineHeight, 0, 0, 0, printModelId);
        txtPrint("log<sub>10</sub> <em>&#964</em><sub>Rosseland</sub>", 10 + xTab, yOffsetT + lineHeight, 0, 0, 0, printModelId);
        txtPrint("log<sub>10</sub> <em>T</em><sub>Kin</sub> (K)", 10 + 2 * xTab, yOffsetT + lineHeight, 0, 0, 0, printModelId);
        txtPrint("log<sub>10</sub> <em>P</em><sub>Gas</sub> (dynes cm<sup>-2</sup>)", 10 + 3 * xTab, yOffsetT + lineHeight, 0, 0, 0, printModelId);
        txtPrint("log<sub>10</sub> <em>P</em><sub>Rad</sub> (dynes cm<sup>-2</sup>)", 10 + 4 * xTab, yOffsetT + lineHeight, 0, 0, 0, printModelId);
        txtPrint("log<sub>10</sub> <em>&#961</em> (g cm<sup>-3</sup>)", 10 + 5 * xTab, yOffsetT + lineHeight, 0, 0, 0, printModelId);
        txtPrint("log<sub>10</sub> <em>N</em><sub>e</sub> (cm<sup>-3</sup>)", 10 + 6 * xTab, yOffsetT + lineHeight, 0, 0, 0, printModelId);
        txtPrint("<em>&#956</em> (a.m.u.)", 10 + 7 * xTab, yOffsetT + lineHeight, 0, 0, 0, printModelId);
        txtPrint("log<sub>10</sub> <em>&#954</em> (cm<sup>2</sup> g<sup>-1</sup>)", 10 + 8 * xTab, yOffsetT + lineHeight, 0, 0, 0, printModelId);
        for (var i = 0; i < numDeps; i++) {
            numPrint(i, 10, yOffsetT + vOffset + i * lineHeight, 0, 0, 0, printModelId);
            value = logE * tauRos[1][i];
            value = value.toPrecision(5);
            numPrint(value, 10 + xTab, yOffsetT + vOffset + i * lineHeight, 0, 0, 0, printModelId);
            value = logE * temp[1][i];
            value = value.toPrecision(5);
            numPrint(value, 10 + 2 * xTab, yOffsetT + vOffset + i * lineHeight, 0, 0, 0, printModelId);
            value = logE * press[1][i];
            value = value.toPrecision(5);
            numPrint(value, 10 + 3 * xTab, yOffsetT + vOffset + i * lineHeight, 0, 0, 0, printModelId);
            value = logE * press[3][i];
            value = value.toPrecision(5);
            numPrint(value, 10 + 4 * xTab, yOffsetT + vOffset + i * lineHeight, 0, 0, 0, printModelId);
            value = logE * rho[1][i];
            value = value.toPrecision(5);
            numPrint(value, 10 + 5 * xTab, yOffsetT + vOffset + i * lineHeight, 0, 0, 0, printModelId);
            value = logE * Ne[1][i];
            value = value.toPrecision(5);
            numPrint(value, 10 + 6 * xTab, yOffsetT + vOffset + i * lineHeight, 0, 0, 0, printModelId);
            value = mmw[i];
            value = value.toPrecision(5);
            numPrint(value, 10 + 7 * xTab, yOffsetT + vOffset + i * lineHeight, 0, 0, 0, printModelId);
            value = logE * kappa[1][i];
            value = value.toPrecision(5);
            numPrint(value, 10 + 8 * xTab, yOffsetT + vOffset + i * lineHeight, 0, 0, 0, printModelId);
        }
    }

    if (ifPrintSED == true) {

        txtPrint("Monochromatic disk integrated surface flux spectral energy distribution (SED)", 10, yOffsetT, 0, 0, 0, printModelId);
        //Column headings:

        var xTab = 190;
        txtPrint("log<sub>10</sub> <em>&#955</em> (cm)", 10, yOffsetT + lineHeight, 0, 0, 0, printModelId);
        txtPrint("log<sub>10</sub> <em>F</em><sub>&#955</sub> (ergs s<sup>-1</sup> cm<sup>-2</sup> cm<sup>-1</sup>)", 10 + xTab, yOffsetT + lineHeight, 0, 0, 0, printModelId);
        for (var i = 0; i < numMaster; i++) {
            value = logE * Math.log(masterLams[i]);
            value = value.toPrecision(9);
            numPrint(value, 10, yOffsetT + vOffset + i * lineHeight, 0, 0, 0, printModelId);
            value = logE * masterFlux[1][i];
            value = value.toPrecision(7);
            numPrint(value, 10 + xTab, yOffsetT + vOffset + i * lineHeight, 0, 0, 0, printModelId);
        }
    }


    if (ifPrintLDC == true) {

        txtPrint("Monochromatic specific intensity distribution", 10, yOffsetT, 0, 0, 0, printModelId);
        //Column headings:

        var xTab = 100;
        txtPrint("log<sub>10</sub><em>&#955</em> (cm)", 10, yOffsetT + lineHeight, 0, 0, 0, printModelId);
        txtPrint("log<sub>10</sub><em>I</em><sub>&#955</sub>(<em>&#952</em>) (ergs s<sup>-1</sup> cm<sup>-2</sup> cm<sup>-1</sup> steradian<sup>-1</sup>)",
                10 + xTab, yOffsetT + lineHeight, 0, 0, 0, printModelId);
        for (var j = 0; j < numThetas; j += 2) {
            value = cosTheta[1][j].toPrecision(5);
            txtPrint("cos <em>&#952</em>=" + value, 10 + (j + 1) * xTab, yOffsetT + 3 * lineHeight, 0, 0, 0, printModelId);
        }

        for (var i = 0; i < numMaster; i++) {
            value = logE * Math.log(masterLams[i]);
            value = value.toPrecision(9);
            numPrint(value, 10, yOffsetT + vOffset + (i + 1) * lineHeight, 0, 0, 0, printModelId);
            for (var j = 0; j < numThetas; j += 2) {
                value = logE * masterIntens[i][j];
                value = value.toPrecision(7);
                numPrint(value, 10 + (j + 1) * xTab, yOffsetT + vOffset + (i + 1) * lineHeight, 0, 0, 0, printModelId);
            }
        }
    }

    if (ifPrintLine == true) {

        txtPrint("Monochromatic line flux and atomic <em>E</em>-level populations", 10, yOffsetT, 0, 0, 0, printModelId);
        var xTab = 190;
        //Column headings:

        txtPrint("log<sub>10</sub> <em>&#955</em> (cm)", 10, yOffsetT + lineHeight, 0, 0, 0, printModelId);
        txtPrint("log<sub>10</sub> <em>F</em><sub>&#955</sub> (ergs s<sup>-1</sup> cm<sup>-2</sup> cm<sup>-1</sup>)",
                10 + xTab, yOffsetT + lineHeight, 0, 0, 0, printModelId);
        for (var i = 0; i < numPoints; i++) {
            value = logE * Math.log(lineLambdas[i]);
            value = value.toPrecision(9);
            numPrint(value, 10, yOffsetT + vOffset + i * lineHeight, 0, 0, 0, printModelId);
            value = logE * lineFlux[1][i];
            value = value.toPrecision(7);
            numPrint(value, 10 + xTab, yOffsetT + vOffset + i * lineHeight, 0, 0, 0, printModelId);
        }



        var atomOffset = 750;
        var xTab = 200;
//From PLOT EIGHT (Grotrian diagram):

        var yData = [0.0, chiI1, chiL, chiU, chiI2];
        //console.log("yDatda[0] " + yData[0] + " yDatda[1] " + yData[1] + " yDatda[2] " + yData[2] + " yDatda[3] " + yData[3]);
        //console.log("chiI1 " + chiI1 + " chiL " + chiL + " chiU " + chiU);
        var yRightTickValStr = ["<em>&#967</em><sub>I</sub>", "<em>&#967</em><sub>II</sub>", "<span style='color:red'><em>&#967</em><sub>l</sub></span>", "<em>&#967</em><sub>u</sub>", "<em>&#967</em><sub>III</sub>"];
        //Column headings:
        txtPrint("log<sub>10</sub> <em>N</em><sub>i</sub> (cm<sup>-3</sup>)", 10, atomOffset + yOffsetT, 0, 0, 0, printModelId);
        txtPrint("i", 10, atomOffset + yOffsetT + 2 * lineHeight, 0, 0, 0, printModelId);
        txtPrint("log<sub>10</sub> <em>&#964</em><sub>Ross</sub>", 10 + xTab, atomOffset + yOffsetT + 2 * lineHeight, 0, 0, 0, printModelId);
        for (var j = 0; j < 5; j++) {
            value = yRightTickValStr[j];
            txtPrint(value, 400 + j * xTab, atomOffset + yOffsetT + 2 * lineHeight, 0, 0, 0, printModelId);
            value = yData[j].toPrecision(5);
            numPrint(value, 400 + j * xTab + 30, atomOffset + yOffsetT + 2 * lineHeight, 0, 0, 0, printModelId);
            txtPrint("eV", 400 + j * xTab + 90, atomOffset + yOffsetT + 2 * lineHeight, 0, 0, 0, printModelId);
        }

        for (var i = 0; i < numDeps; i++) {
            numPrint(i, 10, atomOffset + yOffsetT + (i + 4) * lineHeight, 0, 0, 0, printModelId);
            value = logE * tauRos[1][i];
            value = value.toPrecision(5);
            numPrint(value, 10 + xTab, atomOffset + yOffsetT + (i + 4) * lineHeight, 0, 0, 0, printModelId);
            for (var j = 0; j < 5; j++) {
                value = logE * Math.log(logNums[j][i]);
                value = value.toPrecision(5);
                numPrint(value, 400 + j * xTab, atomOffset + yOffsetT + (i + 4) * lineHeight, 0, 0, 0, printModelId);
            }
        }

    }


//
//
//  *******    END CODE
// 
//
    return;
}
; //end function main()
