/*
 * GrayStar
 * V1.0, June 2014
 * 
 * C. Ian Short
 * Saint Mary's University
 * Department of Astronomy and Physics
 * Institute for Computational Astrophysics (ICA)
 * Halifax, NS, Canada
 * ian.short@smu.ca
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

// *********************************************************
// 
// 
// Spectral line astrophysical functions:

/**
 * Line profile, phi_lambda(lambda): Assume Voigt function profile - need H(a,v)
 * Assumes CRD, LTE, ??? 
 * Input parameters: lam0 - line center wavelength in nm
 * mass - mass of absorbing particle (amu) logGammaCol - log_10(gamma) - base 10
 * logarithmic collisional (pressure) damping co-efficient (s^-1) epsilon -
 * convective microturbulence- non-thermal broadening parameter (km/s) 
 * Also needs
 * atmospheric structure information: numDeps WON'T WORK - need observer's frame
 * fixed lambda at all depths: temp structure for depth-dependent thermal line
 * broadening Teff as typical temp instead of above pressure structure, pGas, if
 * scaling gamma
 */
var lineGrid = function(lam0In, massIn, xiTIn,
        numDeps, teff, numCore, numWing,
        logGammaCol, tauRos, temp, press, tempSun, pressSun) {

    var c = 2.9979249E+10; // light speed in vaccuum in cm/s
    var k = 1.3806488E-16; // Boltzmann constant in ergs/K
    var amu = 1.66053892E-24; // atomic mass unit in g
    var logC = Math.log(c);
    var logK = Math.log(k);
    var ln10 = Math.log(10.0);
    var ln2 = Math.log(2.0);
    var logE = logTen(Math.E); // for debug output
    var ln4pi = Math.log(4.0 * Math.PI);

    //Put input parameters into linear cgs units:
    //double gammaCol = Math.pow(10.0, logGammaCol);
    var logTeff = Math.log(teff);
    var xiT = xiTIn * 1.0E5; //km/s to cm/s
    var lam0 = lam0In; // * 1.0E-7; //nm to cm
    var logLam0 = Math.log(lam0);
    var logMass = Math.log(massIn * amu); //amu to g 

    // Compute depth-independent Doppler width, Delta_lambda_D:
    var doppler, logDopp, logHelp, help;
    logHelp = ln2 + logK + logTeff - logMass; // M-B dist, square of v_mode
    help = Math.exp(logHelp) + xiT * xiT; // quadratic sum of thermal v and turbulent v
    logHelp = 0.5 * Math.log(help);
    logDopp = logHelp + logLam0 - logC;
    doppler = Math.exp(logDopp); // cm

    //Set up a half-profile Delta_lambda grid in Doppler width units 
    //from line centre to wing
    //var numCore = 5;
    //var numWing = 5;
    //int numWing = 0;  //debug
    var numPoints = numCore + numWing;
    //console.log("numPoints " + numPoints + " numCore " + numCore + " numWing " + numWing);
    // a 2D 2 X numPoints array of Delta Lambdas 
    // Row 0 : Delta lambdas in cm - will need to be in nm for Planck and Rad Trans?
    // Row 1 : Delta lambdas in Doppler widths

    var linePoints = [];
    linePoints.length = 2;

    linePoints[0] = [];
    linePoints[1] = [];
    linePoints[0].length = numPoints;
    linePoints[1].length = numPoints;

    // Line profile points in Doppler widths - needed for Voigt function, H(a,v):
    var v = [];
    v.length = numPoints;
    //var maxCoreV = 7.5; //core half-width ~ in Doppler widths
    var maxCoreV = 3.5; //core half-width ~ in Doppler widths - 3.5 sigmas of the Gaussian
    //var maxWingDeltaLogV = 1.7 * ln10; //maximum base e logarithmic shift from line centre in Doppler widths
    //var maxWingDeltaLogV = 3.5 * ln10; //maximum base e logarithmic shift from line centre in Doppler widths
    var minWingDeltaLogV = Math.log(maxCoreV + 1.5);
    //console.log("minWingDeltaLogV " + minWingDeltaLogV);

// Compute Voigt "a" parameer to scale line wing points:
    //var logGammaSun = 9.0 * ln10; // Convert to base e 
    //var gamma, logGamma, logA, voigt, core, wing, logWing, logVoigt, a;
    ////Get index of depth nearest to tauRos=1:
    //var tau1 = tauPoint(numDeps, tauRos, 1.0);
//
    ////Variables for managing honest Voigt profile convolution:
    ////Find value of damping a parameter around tauRos=1.0 for guidance:
    //logGamma = press[1][tau1] - pressSun[1][tau1] + 0.7 * (tempSun[1][tau1] - temp[1][tau1]) + logGammaSun;
    //logGamma = logGamma + logGammaCol;
    ////Voigt "a" parameter in Doppler widths with line centre wavelength:
    //logA = 2.0 * logLam0 + logGamma - ln4pi - logC - logDopp;
    ////logA = Math.max(0.0, 2.0 * logLam0 + logGamma - ln4pi - logC - logDopp);
    ////a = Math.exp(logA);
    ////console.log("a " + a);


    // No! var maxWingDeltaLogV = (2.0 + logA) + minWingDeltaLogV; //maximum base e logarithmic shift from line centre in Doppler widths
    var maxWingDeltaLogV = 9.0 + minWingDeltaLogV;
    //console.log("First value: " + 3.5 * ln10);
    //console.log("Second value: " + (8.0 + minWingDeltaLogV) );

    var logV, ii, jj;
    for (var il = 0; il < numPoints; il++) {

        ii = 1.0 * il;
        if (il < numCore) {

            // In core, space v points linearly:
            // Voigt "v" parameter
            // v > 0 --> This is the *red* wing:
            v[il] = ii * maxCoreV / (numCore - 1);
            linePoints[0][il] = doppler * v[il];
            //console.log("Core il " + il + " v[il] " + v[il] + " linePoints[0][il] " + 1.0e7 * linePoints[0][il]);
            linePoints[1][il] = v[il];
        } else {

            //Space v points logarithmically in wing
            jj = ii - numCore;
            logV = (jj * (maxWingDeltaLogV - minWingDeltaLogV) / (numPoints - 1)) + minWingDeltaLogV;

            v[il] = Math.exp(logV);
            linePoints[0][il] = doppler * v[il];
            //console.log("Wing il " + il + " v[il] " + v[il] + " linePoints[0][il] " + 1.0e7 * linePoints[0][il]);
            linePoints[1][il] = v[il];
        } // end else

        //System.out.println("LineGrid: il, lam, v: " + il + " " + 
        //        linePoints[0][il] + " " + linePoints[1][il]);

    } // il lambda loop

    // Add the negative DeltaLambda half of the line:
    var numPoints2 = (2 * numPoints) - 1;
    //System.out.println("LineGrid: numpoints2: " + numPoints2);

    // Return a 2D 2 X (2xnumPoints-1) array of Delta Lambdas 
    // Row 0 : Delta lambdas in cm - will need to be in nm for Planck and Rad Trans?
    // Row 1 : Delta lambdas in Doppler widths

    var linePoints2 = [];
    linePoints2.length = 2;
    linePoints2[0] = [];
    linePoints2[1] = [];
    linePoints2[0].length = numPoints2;
    linePoints2[1].length = numPoints2;

    //wavelengths are depth-independent - just put them in the 0th depth slot:
    for (var il2 = 0; il2 < numPoints2; il2++) {

        if (il2 < numPoints - 1) {

            var il = (numPoints - 1) - il2;
            linePoints2[0][il2] = -1.0 * linePoints[0][il];
            linePoints2[1][il2] = -1.0 * linePoints[1][il];

            //console.log("Blue: LineGrid: il2 " + il2 + " lambda " +
            //        1.0e7*linePoints2[0][il2] + " v " + linePoints2[1][il2]);

        } else {

            //Positive DelataLambda half:   
            var il = il2 - (numPoints - 1);
            linePoints2[0][il2] = linePoints[0][il];
            linePoints2[1][il2] = linePoints[1][il];

            //console.log("Red: LineGrid: il2 " + il2 + " lambda " +
            //        1.0e7*linePoints2[0][il2] + " v " + linePoints2[1][il2]);
        }



    } //il2 loop


    return linePoints2;
};


/**
 * Line profile, phi_lambda(lambda): Assume Voigt function profile - need H(a,v)
 * Assumes CRD, LTE, ??? 
 * Input parameters: lam0 - line center wavelength in nm
 * mass - mass of absorbing particle (amu) logGammaCol - log_10(gamma) - base 10
 * logarithmic collisional (pressure) damping co-efficient (s^-1) epsilon -
 * convective microturbulence- non-thermal broadening parameter (km/s) 
 * Also needs
 * atmospheric structure information: numDeps WON'T WORK - need observer's frame
 * fixed lambda at all depths: temp structure for depth-dependent thermal line
 * broadening Teff as typical temp instead of above pressure structure, pGas, if
 * scaling gamma
 */
var voigt = function(linePoints, lam0In, logGammaCol,
        numDeps, teff, tauRos, temp, press,
        tempSun, pressSun) {

    var c = 2.9979249E+10; // light speed in vaccuum in cm/s
    var k = 1.3806488E-16; // Boltzmann constant in ergs/K
    var logC = Math.log(c);
    var logK = Math.log(k);

    var lam0 = lam0In; // * 1.0E-7; //nm to cm
    var logLam0 = Math.log(lam0);
    var ln10 = Math.log(10.0);
    var ln2 = Math.log(2.0);
    var ln4pi = Math.log(4.0 * Math.PI);
    var lnSqRtPi = 0.5 * Math.log(Math.PI);
    var sqPi = Math.sqrt(Math.PI);

    var logE = logTen(Math.E); // for debug output

    var doppler = linePoints[0][1] / linePoints[1][1];
    var logDopp = Math.log(doppler);
    //System.out.println("LineProf: doppler, logDopp: " + doppler + " " + logE*logDopp);

    //Put input parameters into linear cgs units:
    //double gammaCol = Math.pow(10.0, logGammaCol);

    // Lorentzian broadening:
    // Assumes Van der Waals dominates radiative damping
    // log_10 Gamma_6 for van der Waals damping around Tau_Cont = 1 in Sun 
    //  - p. 57 of Radiative Transfer in Stellar Atmospheres (Rutten)
    var logGammaSun = 9.0 * ln10; // Convert to base e 
    //double logFudge = Math.log(2.5);  // Van der Waals enhancement factor

    var tau1 = tauPoint(numDeps, tauRos, 1.0);
    //System.out.println("LINEGRID: Tau1: " + tau1);
    //logA = 2.0 * logLam0 + logGamma - ln4pi - logC - logDopp;
    //a = Math.exp(logA);
    //System.out.println("LINEGRID: logA: " + logE * logA);
    //Set up a half-profile Delta_lambda grid in Doppler width units 
    //from line centre to wing

    var numPoints = linePoints[0].length;
    //System.out.println("LineProf: numPoints: " + numPoints);

    // Return a 2D numPoints X numDeps array of normalized line profile points (phi)

    var lineProf = [];
    lineProf.length = numPoints;
    //Have to use Array constructor here:
    for (var row = 0; row < numPoints; row++) {
        lineProf[row] = new Array(numDeps);
    }
    //Java: double[][] lineProf = new double[numPoints][numDeps];

    // Line profiel points in Doppler widths - needed for Voigt function, H(a,v):
    var v = [];
    v.length = numPoints;
    var logV, ii;
//        lineProf[0][0] = 0.0; v[0] = 0.0; //Line centre - cannot do logaritmically!
    var gamma, logGamma, a, logA, voigt, core, wing, logWing, logVoigt;
    var il = 36;
    //console.log("il " + il + " temp[il] " + temp[0][il] + " press[il] " + logE*press[1][il]);
    for (var id = 0; id < numDeps; id++) {

//Formula from p. 56 of Radiative Transfer in Stellar Atmospheres (Rutten),
// logarithmically with respect to solar value:
        logGamma = press[1][id] - pressSun[1][tau1] + 0.7 * (tempSun[1][tau1] - temp[1][id]) + logGammaSun;
        //logGamma = logGamma + logFudge + logGammaCol;
        logGamma = logGamma + logGammaCol;
        //System.out.println("LineGrid: logGamma: " + id + " " + logE * logGamma);

        //Voigt "a" parameter with line centre wavelength:
        logA = 2.0 * logLam0 + logGamma - ln4pi - logC - logDopp;
        a = Math.exp(logA);
        for (var il = 0; il < numPoints; il++) {

            v[il] = linePoints[1][il];
            //System.out.println("LineProf: il, v[il]: " + il + " " + v[il]);
            if (v[il] <= 2.0 && v[il] >= -2.0) {

// - Gaussian ONLY - at line centre Lorentzian will diverge!
                core = Math.exp(-1.0 * (v[il] * v[il]));
                voigt = core;
                //System.out.println("LINEGRID- CORE: core: " + core);

            } else {

                logV = Math.log(Math.abs(v[il]));
                //Gaussian core:
                core = Math.exp(-1.0 * (v[il] * v[il]));
                //System.out.println("LINEGRID- WING: core: " + core);

                //Lorentzian wing:
                logWing = logA - lnSqRtPi - (2.0 * logV);
                wing = Math.exp(logWing);
                voigt = core + wing;
                //voigt = core;  //debug
                //System.out.println("LINEGRID- WING: wing: " + wing + " logV " + logV);

            } // end else

//System.out.println("LINEGRID: il, v[il]: " + il + " " + v[il] + " lineProf[0][il]: " + lineProf[0][il]);
//System.out.println("LINEGRID: il, Voigt, H(): " + il + " " + voigt);
//Convert from H(a,v) in dimensionless voigt untis to physical phi(Delta almbda) profile 
            logVoigt = Math.log(voigt) + 2.0 * logLam0 - lnSqRtPi - logDopp - logC;
            lineProf[il][id] = Math.exp(logVoigt);
            // if (id === 36) {
            //    console.log("il " + il + " linePoints " + 1.0e7 * linePoints[0][il] + " id " + id + " lineProf[il][id] " + lineProf[il][id]);
            //}
        } // il lambda loop

    } //id loop


    /*
     // Check that line profile is area-normalized, per Rutten
     // RESULT: it is NOT, area = 1.4845992503443734E-19!, but IS constant with depth - !?:
     // HOWEVER: line profile seems reasonable anyway - don't ask me.
     var delta;
     for (var id = 0; id < numDeps; id++) {
     var sum = 0.0;
     for (var il = 1; il < numPoints2; il++) {
     delta = linePoints[0][il] - linePoints[0][il - 1];
     sum = sum + (lineProf2[il][id] * delta);
     }
     System.out.println("LineGrid: id, Profile area = " + id + " " + sum );
     }
     */

    return lineProf;
};

var voigt2 = function(linePoints, lam0In, logGammaCol,
        numDeps, teff, tauRos, temp, press,
        tempSun, pressSun) {

    var c = 2.9979249E+10; // light speed in vaccuum in cm/s
    var k = 1.3806488E-16; // Boltzmann constant in ergs/K
    var logC = Math.log(c);
    var logK = Math.log(k);

    var lam0 = lam0In; // * 1.0E-7; //nm to cm
    var logLam0 = Math.log(lam0);
    var ln10 = Math.log(10.0);
    var ln2 = Math.log(2.0);
    var ln4pi = Math.log(4.0 * Math.PI);
    var lnSqRtPi = 0.5 * Math.log(Math.PI);
    var sqPi = Math.sqrt(Math.PI);

    var logE = logTen(Math.E); // for debug output

    var doppler = linePoints[0][1] / linePoints[1][1];
    var logDopp = Math.log(doppler);

    //System.out.println("LineProf: doppler, logDopp: " + doppler + " " + logE*logDopp);

    //Put input parameters into linear cgs units:
    //double gammaCol = Math.pow(10.0, logGammaCol);
    // Lorentzian broadening:
    // Assumes Van der Waals dominates radiative damping
    // log_10 Gamma_6 for van der Waals damping around Tau_Cont = 1 in Sun 
    //  - p. 57 of Radiative Transfer in Stellar Atmospheres (Rutten)
    var logGammaSun = 9.0 * ln10; // Convert to base e 
    //double logFudge = Math.log(2.5);  // Van der Waals enhancement factor

    //Get index of depth nearest to tauRos=1:
    var tau1 = tauPoint(numDeps, tauRos, 1.0);

    //System.out.println("LINEGRID: Tau1: " + tau1);
    //logA = 2.0 * logLam0 + logGamma - ln4pi - logC - logDopp;
    //a = Math.exp(logA);
    //System.out.println("LINEGRID: logA: " + logE * logA);
    //Set up a half-profile Delta_lambda grid in Doppler width units 
    //from line centre to wing
    var numPoints = linePoints[0].length;
    //double maxV = linePoints[1][numPoints - 1]; //maximum value of v in Doppler widths
    //System.out.println("LineProf: numPoints: " + numPoints);

    // Return a 2D numPoints X numDeps array of normalized line profile points (phi)
    var lineProf = [];
    lineProf.length = numPoints;
    //Must use the Array constructor here:
    for (var row = 0; row < numPoints; row++) {
        lineProf[row] = new Array(numDeps);
    }


    // Line profiel points in Doppler widths - needed for Voigt function, H(a,v):
    var v = [];
    v.length = numPoints;
    var logV, ii;

//        lineProf[0][0] = 0.0; v[0] = 0.0; //Line centre - cannot do logaritmically!
    var gamma, logGamma, a, logA, voigt, core, wing, logWing, logVoigt;

    //Variables for managing honest Voigt profile convolution:
    //Find value of damping a parameter around tauRos=1.0 for guidance:
    logGamma = press[1][tau1] - pressSun[1][tau1] + 0.7 * (tempSun[1][tau1] - temp[1][tau1]) + logGammaSun;
    logGamma = logGamma + logGammaCol;
    //Voigt "a" parameter in Doppler widths with line centre wavelength:
    logA = 2.0 * logLam0 + logGamma - ln4pi - logC - logDopp;
    a = Math.exp(logA);
    var yLim0, yLim2, nApprox, deltaY, yLimLower;
    var deltaYApprox = 0.2;
    //var deltaYApprox = 4.0;
    var numY0, numY1, numY2, numY;
    //yLim0 = Math.max(3.5 * a, 3.5); //"a" is characteristic width of Lorentizian in Doppler widths
    yLim0 = Math.max(a, 1.0); //"a" is characteristic width of Lorentizian in Doppler widths
    //CAUTION: integration variable, y, is in Doppler widths
    numY0 = Math.round(yLim0 / deltaYApprox);
    //System.out.println("a " + a + " yLim0 " + yLim0 + " numY0 " + numY0);
    yLim2 = Math.max(3.0 * a, 3.0); //"a" is characteristic width of Lorentizian
    numY2 = Math.round(yLim2 / deltaYApprox);
    var y, logNumerator, logDenominator, logDenomTerm1, logDenomTerm2, denomTerm1, denomTerm2;
    var integ, logInteg, logNextInteg, nextInteg, term;

    for (var id = 0; id < numDeps; id++) {

        //Formula from p. 56 of Radiative Transfer in Stellar Atmospheres (Rutten),
        // logarithmically with respect to solar value:
        logGamma = press[1][id] - pressSun[1][tau1] + 0.7 * (tempSun[1][tau1] - temp[1][id]) + logGammaSun;
        //logGamma = logGamma + logFudge + logGammaCol;
        logGamma = logGamma + logGammaCol;
        //System.out.println("LineGrid: logGamma: " + id + " " + logE * logGamma);

        //Voigt "a" parameter in Doppler widths with line centre wavelength:
        logA = 2.0 * logLam0 + logGamma - ln4pi - logC - logDopp;
        a = Math.exp(logA);

        //System.out.println("LineGrid: logGamma: " + id + " " + logE * logGamma + " " + logE * logA);
        //limits and sampling of integration variable y=(xi/c)*(lambda0/Doppler) (Rutten p. 59) - is this Doppler shift in Doppler widths?
        //Notes: the e^-y^2 numerator is even about y=0, BUT the ((v-y)^2 + a^2 denominator is even about y=v!
        //In the sum over y, the leading term according the numerator alone is always at y=0, 
        // BUT the leading term according to the denominator alone is always at y=v
        // --> Therefore the y integration range should always include both y=0 and y=v (for both +ve and -ve v)
        // --> Adapt y range to each v??
        // Can the y sampling be uniform???
        //int numY = 2 * (int) (yLim / deltaY);
        //System.out.println("numY " + numY);
//            int numY = 20; //I dunno - this is how many i want :-)
//            double deltaY = 2.0 * yLim / ((double) numY);
        //double yMin = -1.0 * yLim;
        //if (id === 30) {
        //    System.out.println("il   v[il]  iy   y   logNumerator   logDenominator   logInteg ");
        //    //System.out.println("voigt2:   v   logVoigt: ");
        //}
        //for (int il = 0; il < numPoints; il++) {
        //Negative half of profiel only - numPoints is always odd and symmetrical about lambda=lambda0
        for (var il = 0; il < (numPoints / 2) + 1; il++) {

            v[il] = linePoints[1][il];
            //System.out.println("LineProf: il, v[il]: " + il + " " + v[il]);
            if (Math.abs(v[il]) < deltaYApprox) {
                numY1 = 0;
                deltaY = deltaYApprox;
            } else {
                nApprox = -1.0 * v[il] / deltaYApprox; // -1.0* becasue we are only treating v<=0 half of profile
                numY1 = Math.round(nApprox);
                deltaY = -1.0 * v[il] / numY1;
            }
            yLimLower = v[il] - deltaY * numY0;
            //yLimUpper = deltaY * numY2; //Do we need this??

            //Total integration range is from yLimLower to v[il] to 0 to yLim:
            numY = numY0 + numY1 + numY2;
            var yLimUpper = yLimLower + numY * deltaY;
            // if (id === 2) {
            //     if (v[il] === -4.0) {
            //         System.out.println("il " + il + " v " + v[il] + " numY0 " + numY0 + " numY1 " + numY1 + " numY2 " + numY2 + " numY " + numY);
            //         System.out.println("il " + il + " v " + v[il] + " yLimLower " + yLimLower + " deltaY " + deltaY + " yLimUpper "
            //                 + yLimUpper);
            //    }
            // }
            voigt = 0.0;// re-initialize H(a,v):
            // loop over 
            //if (id === 35) {
            //    System.out.println("il " + il + " v " + v[il]);
            //}

            // Trapezoid integration: Compute integrand at first y point:
            y = yLimLower;
            logNumerator = -1.0 * y * y;
            logDenomTerm1 = 2.0 * Math.log(Math.abs(v[il] - y));
            logDenomTerm2 = 2.0 * logA;
            denomTerm1 = Math.exp(logDenomTerm1);
            denomTerm2 = Math.exp(logDenomTerm2);
            logDenominator = Math.log(denomTerm1 + denomTerm2);

            logInteg = logNumerator - logDenominator;
            integ = Math.exp(logInteg);

            for (var iy = 1; iy < numY; iy++) {

                y = (1.0 * iy) * deltaY + yLimLower;

                logNumerator = -1.0 * y * y;
                logDenomTerm1 = 2.0 * Math.log(Math.abs(v[il] - y));
                logDenomTerm2 = 2.0 * logA;
                denomTerm1 = Math.exp(logDenomTerm1);
                denomTerm2 = Math.exp(logDenomTerm2);
                logDenominator = Math.log(denomTerm1 + denomTerm2);

                logNextInteg = logNumerator - logDenominator;
                nextInteg = Math.exp(logNextInteg);
                //Trapezoid integration:
                term = 0.5 * (integ + nextInteg) * deltaY;

                // Rectangular pick integration for now:
                //Skip Lorentzian peak - it may be giving us too large a line opacity:
                if (Math.abs(v[il] - y) > 2.0 * deltaYApprox) {
                    voigt = voigt + term;
                    //voigt = voigt + integ * deltaY;
                }

                // if (id === 2) {
                //     if (v[il] === -4.0) {
                //         System.out.println("il, v[il], iy, y, logNumerator, logDenominator, logInteg");
                //         System.out.format("%02d   %12.8f  %02d   %12.8f   %12.8f   %12.8f   %12.8f%n", il, v[il], iy, y, logNumerator, logDenominator, logInteg);
                //         System.out.println("iy, y, logE*logInteg");
                //        System.out.format("%03d   %12.8f   %12.8f%n", iy, y, logE * logInteg);
                //    }
                // }
                //Only treating negative v half of profile, so Lorentzian denominator is always minimal at negative or zero y
                // --> If y > 0 be prepared to stop when contribution becomes negligible:
                //if (y > 0 && (term / voigt < 0.01)) {
                //     break;  //break out of iy loop
                //}
                integ = nextInteg;
            }  //iy loop

            //Pre-factor for H(a,v) integral
            logVoigt = Math.log(voigt) + logA - Math.log(Math.PI);

            //System.out.println("LINEGRID: il, v[il]: " + il + " " + v[il] + " lineProf[0][il]: " + lineProf[0][il]);
            //System.out.println("LINEGRID: il, Voigt, H(): " + il + " " + voigt);
            //Convert from H(a,v) in dimensionless Voigt units to physical phi((Delta lambda) profile:
            logVoigt = logVoigt + 2.0 * logLam0 - lnSqRtPi - logDopp - logC;
            //if (id === 35) {
            //    System.out.format("%12.8f   %12.8f%n", v[il], logE * logVoigt);
            //}
            lineProf[il][id] = Math.exp(logVoigt);

            //Copy over to positive half of profile - avoid doubling the central wavelength!
            if (il != ((numPoints - 1) - il)) {
                lineProf[(numPoints - 1) - il][id] = Math.exp(logVoigt);
            }
            //System.out.println("LineProf: il, id, lineProf[il][id]: " + il + " " + id + " " + lineProf[il][id]);
        } // il lambda loop

        //if (id === 20) {
        //    for (int il = 0; il < numPoints; il++) {
        //        System.out.format("Voigt2: %20.16f   %20.16f%n", linePoints[1][il], logE * Math.log(lineProf[il][id]));
        //    }
        //}
    } //id loop

    return lineProf;

};

// Make line source function:
// Equivalenth two-level atom (ETLA) approx
//CAUTION: input lambda in nm
var lineSource = function(numDeps, tau, temp, lambda) {

    var lineSource = [];
    lineSource.length = numDeps;

    //thermal photon creation/destruction probability
    var epsilon = 0.01; //should decrease with depth??

    //This is an artifact of jayBinner's original purpose:
    var grayLevel = 1.0;

    //int iLam0 = numLams / 2; //+/- 1 deltaLambda
    //double lam0 = linePoints[0][iLam0];  //line centre lambda in cm - not needed:
    //double lamStart = lambda - 0.1; // nm
    //double lamStop = lambda + 0.1; // nm
    //double lamRange = (lamStop - lamStart) * 1.0e-7; // line width in cm

    //System.out.println("lamStart " + lamStart + " lamStop " + lamStop + " lamRange " + lamRange);
    var jayLambda = [];
    jayLambda.length = numDeps;


    var BLambda = [];
    BLambda.length = 2;
    BLambda[0] = [];
    BLambda[1] = [];
    BLambda[0].length = numDeps;
    BLambda[1].length = numDeps;
    var linSrc;

    // Dress up Blambda to look like what jayBinner expects:
    for (var i = 0; i < numDeps; i++) {
        //Planck.planck return log(B_lambda):
        BLambda[0][i] = Math.exp(planck(temp[0][i], lambda));
        BLambda[1][i] = 1.0;  //supposed to be dB/dT, but not needed. 
    }

    //CAUTION: planckBin Row 0 is linear lambda-integrated B_lambda; Row 1 is same for dB_lambda/dT
    //planckBin = MulGrayTCorr.planckBinner(numDeps, temp, lamStart, lamStop);
    jayLambda = jayBinner(numDeps, tau, temp, BLambda, grayLevel);
    //To begin with, coherent scattering - we're not computing line profile-weighted average Js and Bs
    for (var i = 0; i < numDeps; i++) {

        //planckBin[0][i] = planckBin[0][i] / lamRange;  //line average
        //jayBin[i] = jayBin[i];  
        linSrc = (1.0 - epsilon) * jayLambda[i] + epsilon * BLambda[0][i];
        lineSource[i] = Math.log(linSrc);
    }

    return lineSource;
};



// **************************************

// Returns depth distribution of occupation numbers in lower level of b-b transition,
// and in ground states of neutral and singly ionized stages for reference

// Input parameters:
// lam0 - line centre wavelength in nm
// logNl - log_10 column density of absorbers in lower E-level, l (cm^-2)
// logFlu - log_10 oscillator strength (unitless)
// chiL - energy of lower atomic E-level of b-b transition in eV
// chiI - ground state ionization energy to niext higher stage in (ev)
//   - we are assuming this is the neutral stage
// Also needs atsmopheric structure information:
// numDeps
// tauRos structure
// temp structure 
// rho structure
//var levelPops = function(lam0In, logNlIn, Ne, ionized, chiI, chiL, linePoints, lineProf,
//        numDeps, kappaScale, tauRos, temp, rho) {
var levelPops = function(lam0In, logNlIn, Ne, ionized, chiI1, chiI2, chiL, gw1, gw2, gwL,
        numDeps, kappaScale, tauRos, temp, rho) {


    var c = 2.9979249E+10; // light speed in vaccuum in cm/s
    var k = 1.3806488E-16; // Boltzmann constant in ergs/K
    var h = 6.62606957E-27; //Planck's constant in ergs sec
    var ee = 4.80320425E-10; //fundamental charge unit in statcoulombs (cgs)
    var mE = 9.10938291E-28; //electron mass (g)
//Conversion factors
    var eV = 1.602176565E-12; // eV in ergs

//Methods:
//Natural logs more useful than base 10 logs - Eg. Formal soln module: 
// Fundamental constants
    var logC = Math.log(c);
    var logK = Math.log(k);
    var logH = Math.log(h);
    var logEe = Math.log(ee); //Named so won't clash with log_10(e)
    var logMe = Math.log(mE);
//Conversion factors
    var logEv = Math.log(eV);


    var ln10 = Math.log(10.0);
    var logE = logTen(Math.E); // for debug output
    var log2pi = Math.log(2.0 * Math.PI);
    var log2 = Math.log(2.0);

    var logNl = logNlIn * ln10;  // Convert to base e
    var logKScale = Math.log(kappaScale);

    //Assume ground state statistical weight (or partition fn) of Stage III is 1.0;
    var logGw3 = 0.0;

    //For now:
    //double gw1 = 1.0;  //stat weight ground state of Stage I
    //double gw2 = 1.0;  //stat weight ground state of Stage II
    //double gwL = 1.0;  //stat weight lower E-level
    var gwU = 1.0;  //stat weight upper E-level 

    var logGw1 = Math.log(gw1);
    var logGw2 = Math.log(gw2);
    var logGwL = Math.log(gwL);
    var logGwU = Math.log(gwU);

    // If we need to subtract chiI from chiL, do so *before* converting to tiny numbers in ergs!
    if (ionized) {
        chiL = chiL - chiI1;
    }

    //chiI = chiI * eV;  // Convert lower E-level from eV to ergs
    chiI1 = chiI1 * eV;  // Convert lower E-level from eV to ergs
    chiI2 = chiI2 * eV;  // Convert lower E-level from eV to ergs

    //var boltzFacI = chiI / k; // Pre-factor for exponent of excitation Boltzmann factor
    var boltzFacI1 = chiI1 / k; // Pre-factor for exponent of ionization Boltzmann factor for ion stage I
    var boltzFacI2 = chiI2 / k; // Pre-factor for exponent of ionization Boltzmann factor for ion stage I
    //console.log("boltzFacI1 " + boltzFacI1 + " boltzFacI2 " + boltzFacI2 + " chiI1 " + chiI1 + " chiI2 " + chiI2);

    var logSahaFac = log2 + (3.0 / 2.0) * (log2pi + logMe + logK - 2.0 * logH);

    chiL = chiL * eV;  // Convert lower E-level from eV to ergs

    //Log of line-center wavelength in cm
    var logLam0 = Math.log(lam0In); // * 1.0e-7);

    // energy of b-b transition
    var logTransE = logH + logC - logLam0; //ergs
    // Energy of upper E-level of b-b transition
    var chiU = chiL + Math.exp(logTransE);  //ergs

    var boltzFacL = chiL / k; // Pre-factor for exponent of excitation Boltzmann factor
    var boltzFacU = chiU / k; // Pre-factor for exponent of excitation Boltzmann factor

    var boltzFacGround = 0.0 / k; //I know - its zero, but let's do it this way anyway'

    var refRhoIndx = tauPoint(numDeps, tauRos, 1.0);
    var refLogRho = rho[1][refRhoIndx];
    //System.out.println("LINEKAPPA: refRhoIndx, refRho " + refRhoIndx + " " + logE*refRho);

    // return a 2D 3 x numDeps array of logarithmic number densities
    // Row 0: neutral stage ground state population
    // Row 1: ionized stage ground state population
    // Row 2: level population of lower level of bb transition (could be in either stage I or II!) 
    // Row 3: level population of upper level of bb transition (could be in either stage I or II!) 
    var logNumsr0 = [];
    var logNumsr1 = [];
    var logNumsr2 = [];
    var logNumsr3 = [];
    logNumsr0.length = numDeps;
    logNumsr1.length = numDeps;
    logNumsr2.length = numDeps;
    logNumsr3.length = numDeps;
    var logNums = [logNumsr0, logNumsr1, logNumsr2, logNumsr3];

    var num, logNum, expFac, logSaha, saha, logIonFracI, logIonFracII, logNumI, logNumII;
    var saha21, logSaha21, saha32, logSaha32;
    logNumI = 0.0;
    logNumII = 0.0;
    var logNe;

    for (var id = 0; id < numDeps; id++) {

        // reduce or enhance number density by over-all Rosseland opcity scale parameter
        logNum = logNl + logKScale;

        // scale numer density by relative depth variation of mass density
        logNum = logNum + rho[1][id] - refLogRho;

        //// reduce number density by temperature-dependent factor of Saha equation:
        // Normalize wrt to solar Teff so we don't have to evaluate all the other stuff

        //Row 1 of Ne is log_e Ne in cm^-3
        logNe = Ne[1][id];

        /*
         //
         // ********** Accounting for only TWO ionization stages (I & II):
         //
         // This assumes partition fns of unity:
         logSaha = logSahaFac - logNe - boltzFacI / temp[0][id] + (3.0) / (2.0) * temp[1][id]; // log(RHS) of standard Saha equation
         saha = Math.exp(logSaha);   //RHS of standard Saha equation
         //System.out.println("logSahaFac, logNe, logSaha= " + logE*logSahaFac + " " + logE*logNe + " " + logE*logSaha);
         
         logIonFracII = logSaha - Math.log(1.0 + saha); // log ionization fraction in stage II
         logIonFracI = -1.0 * Math.log(1.0 + saha);     // log ionization fraction in stage I
         */

        //
        // ********** Accounting for THREE ionization stages (I, II, III):
        //
        logSaha21 = logSahaFac - logNe - boltzFacI1 / temp[0][id] + (3.0 * temp[1][id] / 2.0) + logGw2 - logGw1; // log(RHS) of standard Saha equation
        saha21 = Math.exp(logSaha21);   //RHS of standard Saha equation
        logSaha32 = logSahaFac - logNe - boltzFacI2 / temp[0][id] + (3.0 * temp[1][id] / 2.0) + logGw3 - logGw2; // log(RHS) of standard Saha equation
        saha32 = Math.exp(logSaha32);   //RHS of standard Saha equation
        //System.out.println("logSahaFac, logNe, logSaha= " + logE*logSahaFac + " " + logE*logNe + " " + logE*logSaha);

        logIonFracII = logSaha21 - Math.log(1.0 + saha21 + saha32 * saha21); // log ionization fraction in stage II
        logIonFracI = -1.0 * Math.log(1.0 + saha21 + saha32 * saha21);     // log ionization fraction in stage I
        //if (id == 36) {
        //    console.log("logSaha21 " + logE*logSaha21 + " logSaha32 " + logE*logSaha32);
        //    console.log("IonFracII " + Math.exp(logIonFracII) + " IonFracI " + Math.exp(logIonFracI) + " logNe " + logE * logNe);
        //}

        // System.out.println("LevelPops: id, ionFracI, ionFracII: " + id + " " + Math.exp(logIonFracI) + " " + Math.exp(logIonFracII) );
        if (ionized) {
            //System.out.println("LevPops: ionized branch taken, ionized =  " + ionized);                

            logNums[0][id] = logNum + logIonFracI; // Ascribe entire neutral stage pop to its ground level
            logNumII = logNum + logIonFracII;
            logNums[1][id] = logNumII - boltzFacGround / temp[0][id] + logGw2; // ground level of ionized stage
            logNums[2][id] = logNumII - boltzFacL / temp[0][id] + logGwL; // lower level of b-b transition
            logNums[3][id] = logNumII - boltzFacU / temp[0][id] + logGwU; // upper level of b-b transition

        } else {
            //System.out.println("LevPops: neutral branch taken, ionized =  " + ionized);

            logNumI = logNum + logIonFracI;
            logNums[0][id] = logNumI - boltzFacGround / temp[0][id] + logGw1;  // ground level of neutral stage
            logNums[1][id] = logNum + logIonFracII; // Ascribe entire ionized stage pop to its ground level
            logNums[2][id] = logNumI - boltzFacL / temp[0][id] + logGwL; // lower level of b-b transition
            logNums[3][id] = logNumI - boltzFacU / temp[0][id] + logGwU; // upper level of b-b transition
        }

        //console.log("LevelPops: id, logNums[0][id], logNums[1][id], logNums[2][id], logNums[3][id]: " + id + " "
        //        + logE * (logNums[0][id]) + " "
        //       + logE * (logNums[1][id]) + " "
        //        + logE * (logNums[2][id]) + " "
        //        + logE * (logNums[3][id]) );

    } //id loop

    return logNums;
};


// Assumes CRD, LTE, ???
// Input parameters:
// lam0 - line centre wavelength in nm
// logNl - log_10 column density of absorbers in lower E-level, l (cm^-2)
// logFlu - log_10 oscillator strength (unitless)
// chiL - energy of lower atomic E-level of b-b transition in eV
// chiI - ground state ionization energy to niext higher stage in (ev)
//
//   //     * PROBLEM: line kappaL values converted to mass extinction by division by rho() are 
// * not consistent with fake Kramer's Law based scaling of kappa_Ros with g.
//*   Try leaving kappaLs as linear extinctions and converting the scaled kappa_Ros back to linear units
// * with solar rho() in LineTau2
// 
// Also needs atsmopheric structure information:
// numDeps
// tauRos structure
// temp structure 
// rho structure
//var lineKap = function(lam0In, logNlIn, logFluIn, ionized, chiI, chiL, linePoints, lineProf,
//        numDeps, kappaScale, tauRos, temp, rho) {
// Level population now computed in LevelPops.levelPops():
var lineKap = function(lam0In, logNums, logFluIn, linePoints, lineProf,
        numDeps, kappaScale, tauRos, temp, rho) {

    var c = 2.9979249E+10; // light speed in vaccuum in cm/s
    var k = 1.3806488E-16; // Boltzmann constant in ergs/K
    var h = 6.62606957E-27; //Planck's constant in ergs sec
    var ee = 4.80320425E-10; //fundamental charge unit in statcoulombs (cgs)
    var mE = 9.10938291E-28; //electron mass (g)
    var eV = 1.602176565E-12; // eV in ergs
    var logC = Math.log(c);
    var logK = Math.log(k);
    var logH = Math.log(h);
    var logEe = Math.log(ee); //Named so won't clash with log_10(e)
    var logMe = Math.log(mE);

    var ln10 = Math.log(10.0);
    var logE = logTen(Math.E); // for debug output
    var log2pi = Math.log(2.0 * Math.PI);
    var log2 = Math.log(2.0);

    var lam0 = lam0In; // * 1.0E-7; //nm to cm
    var logLam0 = Math.log(lam0);
    //var logNl = logNlIn * ln10;  // Convert to base e
    var logFlu = logFluIn * ln10; // Convert to base e
    var logKScale = Math.log(kappaScale);

    // chiI = chiI * eV;  // Convert lower E-level from eV to ergs
    // var boltzFacI = chiI / k; // Pre-factor for exponent of excitation Boltzmann factor
//
    // var logSahaFac = log2 + (3.0 / 2.0) * (log2pi + logMe + logK - 2.0 * logH);
//
    //chiL = chiL * eV;  // Convert lower E-level from eV to ergs
    // var boltzFac = chiL / k; // Pre-factor for exponent of excitation Boltzmann factor

    var numPoints = linePoints[0].length;
    //System.out.println("LineKappa: numPoints: " + numPoints);

    var logPreFac;
    //This converts f_lu to a volume extinction coefficient per particle - Rutten, p. 23
    logPreFac = logFlu + Math.log(Math.PI) + 2.0 * logEe - logMe - logC;
    //System.out.println("LINEKAPPA: logPreFac " + logPreFac);

    //Assume wavelength, lambda, is constant throughout line profile for purpose
    // of computing the stimulated emission correction
    var logExpFac;
    logExpFac = logH + logC - logK - logLam0;
    //System.out.println("LINEKAPPA: logExpFac " + logExpFac);

    // var refRhoIndx = tauPoint(numDeps, tauRos, 1.0);
    // var refLogRho = rho[1][refRhoIndx];
    //System.out.println("LINEKAPPA: refRhoIndx, refRho " + refRhoIndx + " " + logE*refRho);

    // return a 2D numPoints x numDeps array of monochromatic extinction line profiles
    var logKappaL = [];
    logKappaL.length = numPoints;
    //Must use Array constructor here:
    for (var row = 0; row < numPoints; row++) {
        logKappaL[row] = new Array(numDeps);
    }
    //double[][] logKappaL = new double[numPoints][numDeps];

    var num, logNum, logExpFac2, expFac, stimEm, logStimEm, logSaha, saha, logIonFrac;
    var logNe;

    for (var id = 0; id < numDeps; id++) {

        logExpFac2 = logExpFac - temp[1][id];
        expFac = -1.0 * Math.exp(logExpFac2);

        stimEm = 1.0 - Math.exp(expFac);
        logStimEm = Math.log(stimEm);

        // logNums is a 2D 3 x numDeps array of logarithmic number densities
        // Row 0: neutral stage ground state population
        // Row 1: ionized stage ground state population
        // Row 2: level population of lower level of bb transition (could be in either stage I or II!) 
        // Row 3: level population of upper level of bb transition (could be in either stage I or II!) 
        logNum = logNums[2][id];

        //if (id === refRhoIndx) {
        //    System.out.println("LINEKAPPA: logStimEm " + logE*logStimEm);
        //}
        for (var il = 0; il < numPoints; il++) {

            // From Radiative Transfer in Stellar Atmospheres (Rutten), p.31
            // This is a *volume* co-efficient ("alpha_lambda") in cm^-1:
            logKappaL[il][id] = logPreFac + logStimEm + logNum + Math.log(lineProf[il][id]);

            //if (id == 36) {
            //    console.log("il " + il + " logNum " + logE*logNum + " Math.log(lineProf[il][id]) " + logE*Math.log(lineProf[il][id]));
            //    ////    console.log("logPreFac " + logPreFac + " logStimEm " + logStimEm);
            //}

            //console.log("LineKap: il, id: " + il + " " + id + " logPreFac " + logE*logPreFac + " logStimEm " + logE*logStimEm + 
            //        " logNum " + logE*logNum + " lineProf " + logE * Math.log(lineProf[il][id]));

            //Convert to mass co-efficient in g/cm^2:          
            // This direct approach won't work - is not consistent with fake Kramer's law scaling of Kapp_Ros with g instead of rho
            logKappaL[il][id] = logKappaL[il][id] - rho[1][id];
             //if (id === 36) {
             //    console.log("il " + il + " linePoints[0][il] " + 1.0e7*linePoints[0][il] + " id " + id + " logKappaL " + logE*logKappaL[il][id]);
             //}
        } // il - lambda loop

    } // id - depth loop

    return logKappaL;

};

//Create total extinction throughout line profile:
var lineTotalKap = function(linePoints, logKappaL,
        numDeps, kappaScale, kappa) {

    var logE = logTen(Math.E); // for debug output
    var numPoints = linePoints[0].length;

    // return a 2D numPoints x numDeps array of monochromatic *TOTAL* extinction line profiles
    // return a 2D numPoints x numDeps array of monochromatic extinction line profiles
    var logTotKappa = [];
    logTotKappa.length = numPoints;
    //Must use Array constructor here:
    for (var row = 0; row < numPoints; row++) {
        logTotKappa[row] = new Array(numDeps);
    }
    //double[][] logTotKappa = new double[numPoints][numDeps];

    var kappaL;

    for (var id = 0; id < numDeps; id++) {
        for (var il = 0; il < numPoints; il++) {
            //Both kappaL and kappa (continuum) are *mass* extinction (cm^2/g) at thsi point: 
            kappaL = Math.exp(logKappaL[il][id]) + kappa[0][id];
            logTotKappa[il][id] = Math.log(kappaL);
            //if (id === 36) {
            //    console.log("il " + il + " linePoints[0][il] " + 1.0e7*linePoints[0][il] + " logKappaL[il][id] " + logE*logKappaL[il][id] + " kappa[1][id] " + logE*kappa[1][id]);
           // }
        }
    }

    return logTotKappa;

};

/**
 * Method 2: Compute monochromatic tau scales by re-scaling from Tau_Ross -
 * PROBLEM: the approximate, scaled solar kappa_Ros values are not consistent
 * with the prescribed Tau_Ros values HOWEVER: this method removes dependence on
 * the flaky depth scale calculation and vulnerability to low rho value at the
 * surface 
 * 
 * Compute the monochromatic optical depth scale, tau_lambda, at each
 * lambda across the line profile 
 * Also computes line centre Continuum
 * monochromatic optical dpeth scale for continuum rectification And stores it
 * in array element numPoints+1 This may differ from the prescribed Tau_Ross
 * because kappa_Ross was NOT computed consistently with it 
 * 
 * * PROBLEM: line kappaL values converted to mass extinction by division by rho()
 * are not consistent with fake Kramer's Law based scaling of kappa_Ros with g.
 * Try leaving kappaLs as linear extinctions and converting the scaled kappa_Ros
 * back to linear units with solar rho()
 * 
 * Inputs: lineGrid -only neded for row 0 - wavelengths logKappaL - monochromatic line extinction
 * co-efficients kappa - we need the background continuum extinction
 * co-efficients, too!
 */
var tauLambda = function(numDeps, numPoints, logKappaL,
        kappa, tauRos) {

    //No monochromatic optical depth can be less than the Rosseland optical depth,
    // so prevent zero tau_lambda values by setting each tau_lambda(lambda) at the 
    //top of the atmosphere to the tau_Ross value at the top 
    // - prevents trying to take a log of zero!
    var logE = logTen(Math.E); // for debug output
    var minTauL = tauRos[0][0];
    var minLogTauL = tauRos[1][0];

    //var numPoints = linePoints[0].length;

    // returns numPoints+1 x numDeps array: the numPoints+1st row holds the line centre continuum tau scale
    var logTauL = [];
    logTauL.length = numPoints + 1;
    //Must use Array constructor here:
    for (var row = 0; row < numPoints + 1; row++) {
        logTauL[row] = new Array(numDeps);
    }

    var tau1, tau2, delta, tauL,
            integ, logKapRat, logKappaC, lastLogKapRat;

    for (var il = 0; il < numPoints; il++) {

        tau1 = minTauL; //initialize accumulator
        logTauL[il][0] = minLogTauL; // Set upper boundary TauL           

        //System.out.println("LineTau: minTauL: " + minTauL);
        //
        //Trapezoid method: first integrand:
        //total extinction co-efficient

        // Convert kappa_Ros to cm^-1 for consistency with kappaL:
        //logKappaC = kappa[1][0] + rhoSun[1][0];
        logKappaC = kappa[1][0];

        //delta = tauRos[0][1] - tauRos[0][0];
        //logKapRat = logKappaL[il][0] - kappa[1][0];
        //console.log(" il " + il + " logKappaL[il][0] " + logKappaL[il][0] + " logKappaC " + logKappaC);
        lastLogKapRat = logKappaL[il][0] - logKappaC;

        //tau2 = tau1 + ((Math.exp(logKapRat) + 1.0) * delta);
        //opacity being handed in is now total oppcity: line plux continuum:
        //tau2 = tau1 + (Math.exp(logKapRat) * delta);

        //logTauL[il][1] = Math.log(tau2);
        //tau1 = tau2;

        for (var id = 1; id < numDeps; id++) {


            // To test: continue with Euler's method:

            // Convert kappa_Ros to cm^-1 for consistency with kappaL:
            //logKappaC = kappa[1][id] + rhoSun[1][id];
            logKappaC = kappa[1][id];

            delta = tauRos[0][id] - tauRos[0][id - 1];
            //logKapRat = logKappaL[il][id] - kappa[1][id];
            logKapRat = logKappaL[il][id] - logKappaC;

            //tau2 = tau1 + ((Math.exp(logKapRat) + 1.0) * delta);
            //opacity being handed in is now total oppcity: line plux continuum:
            integ = 0.5 * (Math.exp(logKapRat) + Math.exp(lastLogKapRat));
            tau2 = tau1 + (integ * delta);
            //tau2 = tau1 + (Math.exp(logKapRat) * delta);

            logTauL[il][id] = Math.log(tau2);
            tau1 = tau2;
            lastLogKapRat = logKapRat;

            //if (id === 36) {
            //    console.log("il " + il + " id " + id + " logTauL[il][id] " + logE * logTauL[il][id]);
            //}

            // console.log("tauLambda: il, id, logRhoSun, logKappaL, logKappaC, logKapRat, logTauL : " 
            //        + il + " " + id + " " + logE*rhoSun[1][id] + " " + logE*logKappaL[il][id] + " " + logE*logKappaC + " " + logE*logKapRat + " " + logE*logTauL[il][id] );


        } //id loop

    } //il loop
    /* No!
     //This is probably superfluous here, but let's do it this way for consistency with code that was
     // dependent on Method 1:
     //Now compute the monochromatic line centre continuum optical depth scale and store it in an numPoints+1st column of
     // logTauL array:
     for (var id = 0; id < numDeps; id++) {
     
     logTauL[numPoints][id] = tauRos[1][id];
     
     }
     */
    return logTauL;

};

/**
 * Compute the equivalent width of the Voigt line in pm - picometers NOTE: The
 * input parameter 'flux' should be a 2 x (numPoints+1) array where the
 * numPoints+1st value is the line centre monochromatic Continuum flux
 */
var eqWidth = function(flux, linePoints, lam0) { //, fluxCont) {

    var logE = logTen(Math.E); // for debug output

    var Wlambda = 0.0; // Equivalent width in pm - picometers

    var numPoints = linePoints[0].length;

    var delta, logDelta, term, normFlux, logNormFlux, integ, integ2, logInteg, lastInteg, lastTerm, term2;

// Spectrum not normalized - try this instead (redefines input parameter fluxCont):
    var logFluxCont = Math.log((flux[0][0] + flux[0][numPoints - 1]) / 2.0);
    //console.log("logFluxCont " + logE * logFluxCont);

    var iCount = Math.floor(numPoints / 2) - 1; //initialize
    //console.log("numPoints " + numPoints + " iCount " + iCount);
    for (var il = Math.floor(numPoints / 2); il < numPoints; il++) {
        //console.log("il " + il + " flux[0][il]/flux[0][numPoints - 1] " + flux[0][il]/flux[0][numPoints - 1]);
        if (flux[0][il] < 0.99 * flux[0][numPoints - 1]) {
            //console.log("Condition triggered");
            iCount++;
            //console.log("iCount " + iCount);
        }
    }
    //console.log("iCount " + iCount);
    //One more or two more if we can accomodate them:
    if (iCount < numPoints - 1) {
        iCount++;
    }
    if (iCount < numPoints - 1) {
        iCount++;
    }
    var iStart = numPoints - iCount;
    var iStop = iCount;
    //console.log("eqwidth: numPoints " + numPoints + " iStart " + iStart + " iStop " + iStop);

    //Trapezoid rule:       
    // First integrand:

    // Single-point normalization to line-centre flux suitable for narrow lines:
    //normFlux = flux[0][il] / flux[0][numPoints];
    logNormFlux = flux[1][iStart] - logFluxCont;
    //logNormFlux = flux[1][0] - fluxCont[1];
    //normFlux = flux[0][il] / fluxCont[0];
    //System.out.println("flux[0][iStart] " + flux[0][iStart] + " fluxCont " + fluxCont);
    // flux should be less than 0.99 of continuum flux:
    if (logNormFlux >= -0.01) {
        lastInteg = 1.0e-99;
    } else {
        lastInteg = 1.0 - Math.exp(logNormFlux);
    }
    lastTerm = lastInteg; //initialization

    for (var il = iStart + 1; il < iStop; il++) {

        // // To avoid problems, only compute the area of the red half of the line, and double:
        // //Thsi means we have to double compute every point for trapezoid rule instead of recycling...

        // if (linePoints[0][il - 1] > 0.0) {

        //       logNormFlux = flux[1][il - 1] - fluxCont;
        //     //logNormFlux = flux[1][0] - fluxCont[1];
        //     //normFlux = flux[0][il] / fluxCont[0];
        //     //System.out.println("flux[0][il] " + flux[0][il] + " fluxCont[0] " + fluxCont[0]);
        //     if (logNormFlux >= -0.01) {
        //         lastInteg = 1.0e-99;
        //     } else {
        //         lastInteg = 1.0 - Math.exp(logNormFlux);
        //     }

        delta = linePoints[0][il] - linePoints[0][il - 1];
        delta = delta * 1.0E+7;  // cm to nm - W_lambda in pm
        logDelta = Math.log(delta);

        // Single-point normalization to line-centre flux suitable for narrow lines:
        //normFlux = flux[0][il] / fluxCont[0];
        logNormFlux = flux[1][il] - logFluxCont;
        //console.log("il " + il + " flux[1][il] " + logE * flux[1][il]);
        //console.log("il " + il + " normFlux " + Math.exp(logNormFlux));
        //logNormFlux = flux[1][il] - fluxCont[1];


        //term = 1.0 - normFlux;

// flux should be less than 0.99 of continuum flux:
        if (logNormFlux >= -0.01) {
            //console.log("logNormFlux condition FAILED, il: " + il);
            integ = 1.0e-99;
        } else {
            integ = 1.0 - Math.exp(logNormFlux);
        }


        //Trapezoid rule:
        integ2 = 0.5 * (lastInteg + integ);
        logInteg = Math.log(integ2);
        term = Math.exp(logInteg + logDelta);

        //Make sure weird features near the red edge don't pollute our Wlambda:
        // for lambda > line centre, area sould be monotically *decreasing*
        //console.log("il " + il + " linePoints[0][il] " + linePoints[0][il] + " lam0 " + lam0 + " integ " + integ + " lastInteg " + lastInteg);
        if ((linePoints[0][il] > 0.0) && (term > lastTerm)) {
            //console.log("term condition FAILED, il: " + il);
            //term2 = lastTerm / 2.0;
            term2 = term; //the above condition giving too small EWs
        } else {
            term2 = term;
        }


        //console.log("il " + il + " logNormFlux " + logE * logNormFlux + " integ " + integ + " term " + term);

        //Wlambda = Wlambda + (term * delta);
        Wlambda = Wlambda + term2;

        lastTerm = term; //For catching problems
        lastInteg = integ;

        //System.out.println("EqWidth: il " + il + " delta " + delta + " term " + term + " normFlux " + normFlux );
        //System.out.println("EqWidth: Wlambda: " + Wlambda);
        //} // if condition for red half of line only
    }

    // Double to pick up blue half and Convert area in nm to pm - picometers
    Wlambda = Wlambda * 1.0E3;

    return Wlambda;

};

/**
 *
 * Create master kappa_lambda(lambda) and tau_lambda(lambda) for
 * FormalSoln.formalSoln()
 *
 * @author Ian
 */

//Merge comntinuum and line wavelength scales - for one line
//This expects *pure* line opacity - no continuum opacity pre-added!
var masterLambda = function(numLams, numMaster, numNow, masterLams, numPoints, listLineLambdas) {
    //                                 

    //int numCnt = lambdaScale.length;
    //skip the last wavelength point in the line lambda grid - it holds the line centre wavelength
    //int numLine = lineLambdas.length - 1;

    var numTot = numNow + numPoints; //current dynamic total

    //System.out.println("numCnt " + numCnt + " numLine " + numLine + " numTot " + numTot);
    /*
     for (int i = 0; i < numCnt; i++) {
     System.out.println("i " + i + " lambdaScale[i] " + lambdaScale[i]);
     }
     for (int i = 0; i < numLine; i++) {
     System.out.println("i " + i + " lineLambdas[i] " + lineLambdas[i]);
     }
     */
    //Row 0 is merged lambda scale
    //Row 1 is log of *total* (line plus continuum kappa
    var masterLamsOut = [];
    masterLamsOut.length = numTot;

    // Merge wavelengths into a sorted master list
    //initialize with first continuum lambda:
    var lastLam = masterLams[0];
    masterLamsOut[0] = masterLams[0];
    var nextCntPtr = 1;
    var nextLinePtr = 0;
    for (var iL = 1; iL < numTot; iL++) {
        if (nextCntPtr < numNow) {
            //System.out.println("nextCntPtr " + nextCntPtr + " lambdaScale[nextCntPtr] " + lambdaScale[nextCntPtr]);
            //System.out.println("nextLinePtr " + nextLinePtr + " lineLambdas[nextLinePtr] " + lineLambdas[nextLinePtr]);
            if ((masterLams[nextCntPtr] < listLineLambdas[nextLinePtr])
                    || (nextLinePtr >= numPoints - 1)) {
                //Next point is a continuum point:
                masterLamsOut[iL] = masterLams[nextCntPtr];
                nextCntPtr++;

            } else if ((listLineLambdas[nextLinePtr] < masterLams[nextCntPtr])
                    && (nextLinePtr < numPoints - 1)) {
                //Next point is a line point:
                masterLamsOut[iL] = listLineLambdas[nextLinePtr];
                nextLinePtr++;

            }
        }
        //System.out.println("iL " + iL + " masterLamsOut[iL] " + masterLamsOut[iL]);
    } //iL loop
    //Make sure final wavelength point in masterLams is secured:
    masterLamsOut[numTot - 1] = masterLams[numNow - 1];

    return masterLamsOut;
};

var masterKappa = function(numDeps, numLams, numMaster, numNow, masterLams, masterLamsOut, logMasterKaps, numPoints, listLineLambdas, listLogKappaL) {
//                                          
    var logE = logTen(Math.E); // for debug output

    //int numLams = masterLams.length;
    var numTot = numNow + numPoints;

    var logMasterKapsOut = [];
    logMasterKapsOut.length = numTot;
    //Must use Array constructor here:
    for (var i = 0; i < numTot; i++) {
        logMasterKapsOut[i] = new Array(numDeps);
    }
    //double[][] kappa2 = new double[2][numTot];
    //double[][] lineKap2 = new double[2][numTot];
    var kappa2, lineKap2, totKap;
    lineKap2 = 1.0e-99; //initialization

    //int numCnt = lambdaScale.length;
    //int numLine = lineLambdas.length - 1;
    var kappa1D = [];
    kappa1D.length = numNow;
    var lineKap1D = [];
    lineKap1D.length = numPoints;
    //System.out.println("iL   masterLams    logMasterKappa");
    for (var iD = 0; iD < numDeps; iD++) {

        //Extract 1D *linear* opacity vectors for interpol()
        for (var k = 0; k < numNow; k++) {
            kappa1D[k] = Math.exp(logMasterKaps[k][iD]); //actually wavelength independent - for now
        }

        for (var k = 0; k < numPoints; k++) {
            lineKap1D[k] = Math.exp(listLogKappaL[k][iD]);
        }

        //Interpolate continuum and line opacity onto master lambda scale, and add them lambda-wise:
        for (var iL = 0; iL < numTot; iL++) {
            kappa2 = interpol(masterLams, kappa1D, masterLamsOut[iL]);
            lineKap2 = 1.0e-99; //re-initialization
            if ((masterLamsOut[iL] >= listLineLambdas[0]) && (masterLamsOut[iL] <= listLineLambdas[numPoints - 1])) {
                lineKap2 = interpol(listLineLambdas, lineKap1D, masterLamsOut[iL]);
                //lineKap2 = 1.0e-99;  //test
            }
            //test lineKap2 = 1.0e-99;  //test
            totKap = kappa2 + lineKap2;
            logMasterKapsOut[iL][iD] = Math.log(totKap);
            //if (iD === 36) {
            //    System.out.format("%02d   %12.8e   %12.8f%n", iL, masterLams[iL], logE * logMasterKappa[iL][iD]);
            //}
        }
    }

    return logMasterKapsOut;
};




