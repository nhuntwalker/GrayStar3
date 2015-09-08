/*
 * GrayStar
 * V1.0, June 2014
 * 
 * C. Ian Short
 * Saint Mary's University
 * Department of Astronomy and Physics
 * Institute for Computational Astrophysics (ICA)
 * Halifax, NS, Canada
 *  * ian.short@smu.ca
 * www.ap.smu.ca/~ishort/
 *
 * 1D, static, plane-parallel, LTE, gray stellar atmospheric model
 * core + wing approximation to Voigt spectral line profile
 *
 * Suitable for pedagogical purposes only
 * 
 * Logic written in Java SE 8.0, JDK 1.8
 * GUI written with JavaFX 8.0
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

"use strict";  //testing only!

// Global variables - Doesn't work - scope not global!

var c = 2.9979249E+10; // light speed in vaccuum in cm/s
var sigma = 5.670373E-5; //Stefan-Boltzmann constant ergs/s/cm^2/K^4  
var k = 1.3806488E-16; // Boltzmann constant in ergs/K
var h = 6.62606957E-27; //Planck's constant in ergs sec
var ee = 4.80320425E-10; //fundamental charge unit in statcoulombs (cgs)
var mE = 9.10938291E-28; //electron mass (g)
//Conversion factors
var amu = 1.66053892E-24; // atomic mass unit in g
var eV = 1.602176565E-12; // eV in ergs

//Methods:
//Natural logs more useful than base 10 logs - Eg. Formal soln module: 
// Fundamental constants
var logC = Math.log(c);
var logSigma = Math.log(sigma);
var logK = Math.log(k);
var logH = Math.log(h);
var logEe = Math.log(ee); //Named so won't clash with log_10(e)
var logMe = Math.log(mE);
//Conversion factors
var logAmu = Math.log(amu);
var logEv = Math.log(eV);
// ********************************************
// 
// 
// Utility functions:
//
//
// ********************************************



// logTen function (JS only provides natural log as standard on all browsers)

var logTen = function(x) {

// JS' 'log()' is really ln()

    return Math.log(x) / Math.LN10;
} //end logTen


// numToPxStng function to convert operable and calculable numbers into strings in 'px' for setting HTML style attributes

var numToPxStrng = function(x) {

    var xStr = x.toString(10) + "px"; // argument means interpret x as base 10 number

    return xStr;
} //end numToPxStrng


/*
 Linear interpolation to a new abscissa - mainly for interpoalting flux to a specific lambda
 This version for 2XN vector where we want to interpolate in row 1 - log units
 */

var interpol2 = function(x, y, newX) {

    var newY;
    // Bracket newX:
    var x1, x2;
    var p1, p2;
    p1 = 0;
    p2 = 1;
    x1 = x[p1];
    x2 = x[p2];
    for (var i = 1; i < x.length; i++) {
        if (x[i] >= newX) {
// Found upper bracket
            p2 = i;
            p1 = i - 1;
            x2 = x[p2];
            x1 = x[p1];
            break;
        }
    }

    var step = x2 - x1;
    //Interpolate
    // y is probably flux - Row 1 is log flux - let's interpolate in log space
    newY = y[1][p2] * (newX - x1) / step
            + y[1][p1] * (x2 - newX) / step;
    //System.out.println("Interpol: p1, p2, x1, x2, y1, y2, newX, newY: " + 
    //        p1 + " " + p2 + " " + x1 + " " + x2 + " " + y[1][p1] + " " + y[1][p2] + " " + newX + " " + newY + " ");
    //numPrint(roundNum, 100, 300, masterId); //debug

    return newY;
};

/*
 Linear interpolation to a new abscissa - mainly for interpolating flux to a specific lambda
 */

var interpol = function(x, y, newX) {

    var newY;
    var num = x.length;
    // Bracket newX:
    var x1, x2;
    var p1, p2;
    p1 = 0;
    p2 = 1;
    x1 = x[p1];
    x2 = x[p2];
    for (var i = 1; i < num; i++) {

        if (x[0] < x[num - 1]) {
            // Case of monotonically increasing absicissae
            if (x[i] >= newX) {
// Found upper bracket
                p2 = i;
                p1 = i - 1;
                x2 = x[p2];
                x1 = x[p1];
                break;
            }
        } else {
            // Case of monotonically decreasing absicissae
            if (x[i] <= newX) {
// Found upper bracket
                p2 = i;
                p1 = i - 1;
                x2 = x[p2];
                x1 = x[p1];
                break;
            }
        }

    }

    var step = x2 - x1;
    //Interpolate
    newY = y[p2] * (newX - x1) / step
            + y[p1] * (x2 - newX) / step;
    //System.out.println("Interpol: p1, p2, x1, x2, y1, y2, newX, newY: " + 
    //        p1 + " " + p2 + " " + x1 + " " + x2 + " " + y[1][p1] + " " + y[1][p2] + " " + newX + " " + newY + " ");
    //numPrint(roundNum, 100, 300, masterId); //debug

    return newY;
};



/**
 * Return the array index of the optical depth arry (tauRos) closest to a
 * desired value of optical depth (tau) Assumes the use wants to find a *linear*
 * tau value , NOT logarithmic
 */
var tauPoint = function(numDeps, tauRos, tau) {

    var index;
    var help = [];
    help.length = numDeps;
    for (var i = 0; i < numDeps; i++) {

        help[i] = tauRos[0][i] - tau;
        help[i] = Math.abs(help[i]);
    }
    index = 0;
    var min = help[index];
    for (var i = 1; i < numDeps; i++) {

        if (help[i] < min) {
            min = help[i];
            index = i;
        }

    }

    return index;
};

/**
 * Return the array index of the wavelength array (lambdas) closest to a desired
 * value of wavelength (lam)
 */

var lamPoint = function(numLams, lambdas, lam) {

    var index;

    var help = [];
    help.length = numLams;

    for (var i = 0; i < numLams; i++) {

        help[i] = lambdas[i] - lam;
        help[i] = Math.abs(help[i]);

    }
    index = 0;
    var min = help[index];

    for (var i = 1; i < numLams; i++) {

        if (help[i] < min) {
            min = help[i];
            index = i;
        }

    }

    return index;

};

/**
 * Find the wavelength where a spectral line profile is half of its minimum,
 * line-centre brightness Assume symmetric (pure Voigt) profile?
 *
 * Returns the integer indices of the red half-power and line-centre wavelengths
 */

var halfPower = function(numPoints, lineFlux) {

    var keyLambdas = [];
    keyLambdas.length = 2;

    // CAUTION; numPoints-1st value holds the line centre monochromatic *continuum* flux for normalization
    // Extract 1D vector of linear continuum normalized fluxes of length numPoints-1
    var flux1D = [];
    flux1D.length = numPoints - 1;

    for (var i = 0; i < numPoints - 1; i++) {
        flux1D[i] = lineFlux[0][i] / lineFlux[0][numPoints - 1];
    }

    // To be on the safe side, let's "rediscover" the line centre of wavelength of minimum brightness:
    var minmax = minMax(flux1D);
    keyLambdas[0] = minmax[0]; // line centre index

    var help = [];
    help.length = numPoints - keyLambdas[0] - 1;
    var half;
    half = flux1D[keyLambdas[0]] + ((1.0 - flux1D[keyLambdas[0]]) / 2.0);
    //System.out.println("HalfPower: half power flux: " + half);

    for (var i = keyLambdas[0]; i < numPoints - 1; i++) {

        // The last minimum of help should be the red half-depth point
        help[i - keyLambdas[0]] = Math.abs(flux1D[i] - half);
        //System.out.println("HalfPower: i, i - keyLambdas[0], fluxiD, help: " 
        //        + i + " " + (i - keyLambdas[0]) + " " + flux1D[i] + " " + help[i - keyLambdas[0]] );
    }

    minmax = minMax(help);
    keyLambdas[1] = minmax[0] + keyLambdas[0]; // red half-power index
    //System.out.println("HalfPower: minmax[0]: " + keyLambdas[1]);

    return keyLambdas;

};

/**
 * Return the array indices of minimum and maximum values of an input 1D array CAUTION; Will
 * return the *first* occurence if min and/or max values occur in multiple
 * places iMinMax[0] = first occurence of minimum iMinMax[1] = first occurence
 * of maximum
 */
var minMax = function(x) {

    var iMinMax = [];
    iMinMax.length = 2;

    var num = x.length;
    //System.out.println("MinMax: num: " + num);

    var iMin = 0;
    var iMax = 0;
    var min = x[iMin];
    var max = x[iMax];

    for (var i = 1; i < num; i++) {

        //System.out.println("MinMax: i , current min, x : " + i + " " + min + " " + x[i]);
        if (x[i] < min) {
            //System.out.println("MinMax: new min: if branch triggered" );
            min = x[i];
            iMin = i;
        }
        //System.out.println("MinMax: new min: " + min);

        if (x[i] > max) {
            max = x[i];
            iMax = i;
        }

    }
    //System.out.println("MinMax: " + iMin + " " + iMax);

    iMinMax[0] = iMin;
    iMinMax[1] = iMax;

    return iMinMax;

};


/**
 * Version of MinMax.minMax for 2XnumDep & 2XnumLams arrays where row 0 is
 * linear and row 1 is logarithmic
 *
 * Return the array indices of the minimum and maximum values of an input 1D array CAUTION; Will
 * return the *first* occurence if min and/or max values occur in multiple
 * places iMinMax[0] = first occurence of minimum iMinMax[1] = first occurence
 * of maximum
 */
var minMax2 = function(x) {

    var iMinMax = [];
    iMinMax.length = 2;

    var num = x[0].length;

    var iMin = 0;
    var iMax = 0;

    // Search for minimum and maximum in row 0 - linear values:
    var min = x[0][iMin];
    var max = x[0][iMax];

    for (var i = 1; i < num; i++) {

        if (x[0][i] < min) {
            min = x[0][i];
            iMin = i;
        }

        if (x[0][i] > max) {
            max = x[0][i];
            iMax = i;
        }

    }

    iMinMax[0] = iMin;
    iMinMax[1] = iMax;

    return iMinMax;

};




