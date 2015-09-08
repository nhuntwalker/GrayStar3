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
// // *********************************************************
// 
// 
// Radiative transfer astrophysical functions:
//

var lamgrid = function(numLams, lamSetup) {


    var lambdaScale = [];
    lambdaScale.length = numLams;
    var logLambda;
    // Space lambdas logarithmically:
    var logLam1 = logTen(lamSetup[0]);
    var logLam2 = logTen(lamSetup[1]);
    var delta = (logLam2 - logLam1) / numLams;
    var ii;
    for (var i = 0; i < numLams; i++) {

        ii = 1.0 * i;
        logLambda = logLam1 + (ii * delta);
        lambdaScale[i] = Math.pow(10.0, logLambda);
        //System.out.println("il " + i + " lambda: " + lambdaScale[i]); //debug

    }

    return lambdaScale;
};


var thetas = function() {

    //int numThetas = 10; // guess
    //double[] cosTheta = new double[numThetas];
    // Try equal distribution in cos(theta) space (rather than Gaussian quadrature)

    //  cosTheta is a 2xnumThetas array:
    // row 0 is used for Gaussian quadrature weights
    // row 1 is used for cos(theta) values
    // Gaussian quadrature:


    /* ***************
     "n = 21" Gaussian quadrature weights, w_i, and abscissae from 
     http://pomax.github.io/bezierinfo/legendre-gauss.html
     - ie. 11 point among 0 and positive abcissae
     
     This 11/21 of a 21-point formula: 0 plus the positive abscissae ,
     so I *think* it represents *half* the integral on the interval [-1,1],
     ie., on the interval[0,1].   SO: Divide the first weight (x=0) by 2 so 
     that the quadrature sum is exactly half the integral on [-1,1]. 
     ********** */


    var nGauss = 21;
    var theta = [];
    theta.length = nGauss;
    var weight = [];
    weight.length = nGauss;
    var cosTheta = [weight, theta];
    // I *think* the "thetas" being assigned here (abcissae) are fractional
    // angles, theta/(pi/2).

    // For nGauss = 7;
    //           // 7 points on [0,1] from 13 point Gaussian quadrature on [-1,1]
    // weight[0] = 0.2325515532308739;  // disk center
    //  theta[0] = 0.0000000000000000;
    // weight[1] = 0.2262831802628972;
    //  theta[1] = 0.2304583159551348;
    //  weight[2] = 0.2078160475368885;
    //  theta[2] = 0.4484927510364469;
    //   weight[3] = 0.1781459807619457;
    //   theta[3] = 0.6423493394403402;
    //   weight[4] = 0.1388735102197872;
    //   theta[4] = 0.8015780907333099;
    //   weight[5] = 0.0921214998377285;
    //   theta[5] = 0.9175983992229779;
    //   weight[6] = 0.0404840047653159;
    //  theta[6] = 0.9841830547185881;   //limb

    // For nGauss = 9;
    // 9 points on [0,1] from 17 point Gaussian quadrature on [-1,1]    
    //weight[0] = 0.1794464703562065;  //disk center
    //theta[0] = 0.0000000000000000;
    //weight[1] = 0.1765627053669926;
    //theta[1] = 0.1784841814958479;
    //weight[2] = 0.1680041021564500;
    //theta[2] = 0.3512317634538763;
    //weight[3] = 0.1540457610768103;
    //theta[3] = 0.5126905370864769;
    //weight[4] = 0.1351363684685255;
    //theta[4] = 0.6576711592166907;
    //weight[5] = 0.1118838471934040;
    //theta[5] = 0.7815140038968014;
    //weight[6] = 0.0850361483171792;
    //theta[6] = 0.8802391537269859;
    //weight[7] = 0.0554595293739872;
    //theta[7] = 0.9506755217687678;
    //weight[8] = 0.0241483028685479;
    //theta[8] = 0.9905754753144174;  //limb


    // For nGauss = 11;
    // 11 points on [0,1] from 21 point Gaussian quadrature on [-1,1]    
    // // No? weight[0] = 0.5 * 0.1460811336496904;  // Divide the weight of the x=0 point by 2!  
    //weight[0] = 0.1460811336496904;
    //theta[0] = 0.0000000000000000; //disk centre
    //weight[1] = 0.1445244039899700;
    //theta[1] = 0.1455618541608951;
    //weight[2] = 0.1398873947910731;
    //theta[2] = 0.2880213168024011;
    //weight[3] = 0.1322689386333375;
    //theta[3] = 0.4243421202074388;
    //weight[4] = 0.1218314160537285;
    //theta[4] = 0.5516188358872198;
    //weight[5] = 0.1087972991671484;
    //theta[5] = 0.6671388041974123;
    //weight[6] = 0.0934444234560339;
    //theta[6] = 0.7684399634756779;
    //weight[7] = 0.0761001136283793;
    //theta[7] = 0.8533633645833173;
    //weight[8] = 0.0571344254268572;
    //theta[8] = 0.9200993341504008;
    //weight[9] = 0.0369537897708525;
    //theta[9] = 0.9672268385663063;
    //weight[10] = 0.0160172282577743;
    //theta[10] = 0.9937521706203895; //limb

    // For nGauss = 21;
    // 11 points on [0,1] from 41 point Gaussian quadrature on [-1,1]    
    weight[0] = 0.0756955356472984;
    theta[0] = 0.0000000000000000;
    weight[1] = 0.0754787470927158;
    theta[1] = 0.0756232589891630;
    weight[2] = 0.0748296231762215;
    theta[2] = 0.1508133548639922;
    weight[3] = 0.0737518820272235;
    theta[3] = 0.2251396056334228;
    weight[4] = 0.0722516968610231;
    theta[4] = 0.2981762773418249;
    weight[5] = 0.0703376606208175;
    theta[5] = 0.3695050226404815;
    weight[6] = 0.0680207367608768;
    theta[6] = 0.4387172770514071;
    weight[7] = 0.0653141964535274;
    theta[7] = 0.5054165991994061;
    weight[8] = 0.0622335425809663;
    theta[8] = 0.5692209416102159;
    weight[9] = 0.0587964209498719;
    theta[9] = 0.6297648390721963;
    weight[10] = 0.0550225192425787;
    theta[10] = 0.6867015020349513;
    weight[11] = 0.0509334542946175;
    theta[11] = 0.7397048030699261;
    weight[12] = 0.0465526483690143;
    theta[12] = 0.7884711450474093;
    weight[13] = 0.0419051951959097;
    theta[13] = 0.8327212004013613;
    weight[14] = 0.0370177167035080;
    theta[14] = 0.8722015116924414;
    weight[15] = 0.0319182117316993;
    theta[15] = 0.9066859447581012;
    weight[16] = 0.0266358992071104;
    theta[16] = 0.9359769874978539;
    weight[17] = 0.0212010633687796;
    theta[17] = 0.9599068917303463;
    weight[18] = 0.0156449384078186;
    theta[18] = 0.9783386735610834;
    weight[19] = 0.0099999387739059;
    theta[19] = 0.9911671096990163;
    weight[20] = 0.0043061403581649;
    theta[20] = 0.9983215885747715;


    for (var it = 0; it < nGauss; it++) {
        cosTheta[0][it] = weight[it];
        theta[it] = theta[it] * Math.PI / 2.0;
        cosTheta[1][it] = Math.cos(theta[it]);
    }


    return cosTheta;
};


/**
 * Formal solution of the LTE radiative transfer for the monochromatic *surface*
 * intensity, I_lambda(Tau=0, theta) at wavelength lambda
 *
 * Calls Planck.planck(lambda, temp) to get the LTE source function 
 * //Input lambda in nm for Planck
 */
var formalSoln = function(numDeps, cosTheta, lambda, tau, temp, lineMode) {

    var logE = logTen(Math.E); //for debug output

    var cutoff = 0.001; // tolerance for stopping deeper contriibutions to I(Tau=0)
    //  cosTheta is a 2xnumThetas array:
    // row 0 is used for Gaussian quadrature weights
    // row 1 is used for cos(theta) values
    // Gaussian quadrature:
    // Number of angles, numThetas, will have to be determined after the fact
    var numThetas = cosTheta[0].length;
    //System.out.println("FORMALSOLN: numThetas= " + numThetas);
    //double[][] intens = new double[numLams][numThetas];
    var intens = [];
    intens.length = numThetas;
    //double[] intens = new double[numThetas];

    // scratch variables:
    var logSource, lnInteg, integrand, invCosTheta, delta, newInt, increment;
    var lineSourceVec = [];
    lineSourceVec.length = numDeps;

    //Get line source function vector, of needed:
    if (lineMode) {
        lineSourceVec = lineSource(numDeps, tau, temp, lambda);
    }
    //for (int il = 0; il < numLams; il++ ) {
    for (var it = 0; it < numThetas; it++) {

        invCosTheta = 1.0 / cosTheta[1][it];
        newInt = 0;
        // Extended Simpson's Rule - Numerical Recipes in F77, 2nd Ed., p. 128
        // First point in formula:
        //lnSource = planck(temp[0][0], lambda);
        //lnInteg = lnSource - (tau[0][0] * invCosTheta);
        //integrand = Math.exp(lnInteg) * invCosTheta;
        //delta = (tau[0][1] - tau[0][0]);
        //increment = (1.0 / 3.0) * integrand * delta;
        //newInt = newInt + increment;
        // for (var id = 1; id < numDeps - 1; id++) {  // Extended Simpson's Rule
        for (var id = 1; id < numDeps; id++) {   // Extended rectangle Rule

            if (lineMode) {
                //Line mode mode - ETLA + coherent scattering: S_lambda = (1-eps)*J_lambda + eps*B_lambda
                logSource = lineSourceVec[id];
                //if (id === 5 && it === 0) {
                 //   console.log("logSource scat " + logE * logSource);
                //}
                ////logSource = planck(temp[0][id], lambda);
                //if (id === 5 && it === 0) {
                //    console.log("logSource therm " + logE * logSource);
                //}
            } else {
                //Continuum mode - S_lambda = B_lambda
                logSource = planck(temp[0][id], lambda);
            }

            logSource = planck(temp[0][id], lambda);
            lnInteg = logSource - (tau[0][id] * invCosTheta);
            integrand = Math.exp(lnInteg) * invCosTheta;
            delta = (tau[0][id] - tau[0][id - 1]);

// Extended Simpson's Rule
            //if ((id % 2) === 1) {
            //    increment = (4.0 / 3.0) * integrand * delta;
            //    newInt = newInt + increment;
            //}
//
            //          if ((id % 2) === 0) {
            //            increment = (2.0 / 3.0) * integrand * delta;
            //          newInt = newInt + increment;
            //    }

            // Extended rectangle rule:
            increment = integrand * delta;
            newInt = newInt + increment;

            // the following break-out condition is not so simple if using a closed formula: 
            // //Only keep adding contributions from deper layers if the contribution
            // // is significant

            if (tau[0][id] > 2.0 / 3.0) {
                if (newInt > 0) {
                    if (increment / newInt < cutoff) {
                        break;
                    }
                }
            }
        } //id - depth loop

        ////Last point: Extended Simpson's Rule
        //lnSource = planck(temp[0][numDeps - 1], lambda);
        //lnInteg = lnSource - (tau[0][numDeps - 1] * invCosTheta);
        //integrand = Math.exp(lnInteg) * invCosTheta;
        //delta = (tau[0][numDeps - 1] - tau[0][numDeps - 2]);
        //increment = (1.0 / 3.0) * integrand * delta;
        //newInt = newInt + increment;

        intens[it] = newInt;
    }   //it - theta loop

    //} // il - lambda loop
    return intens;
};


/**
 * Inputs: lambda: a single scalar wavelength in nm temp: a single scalar
 * temperature in K Returns log of Plank function in logBBlam - B_lambda
 * distribution in pure cgs units: ergs/s/cm^2/ster/cm
 */
var planck = function(temp, lambda) {

    //int numLams = (int) (( lamSetup[1] - lamSetup[0] ) / lamSetup[2]) + 1; 
    var logBBlam; //, BBlam;

    var c = 2.9979249E+10; // light speed in vaccuum in cm/s
    var k = 1.3806488E-16; // Boltzmann constant in ergs/K
    var h = 6.62606957E-27; //Planck's constant in ergs sec
    var logC = Math.log(c);
    var logK = Math.log(k);
    var logH = Math.log(h);
    var logPreFac = Math.log(2.0) + logH + 2.0 * logC; //log
    var logExpFac = logH + logC - logK; //log
    //double preFac = 2.0 * h * ( c * c );  //linear
    //double expFac = ( h / k ) * c;      //linear

    //System.out.println("logC " + logC + " logK " + logK + " logH " + logH);
    //System.out.println("logPreFac " + logPreFac + " logExpFac " + logExpFac);
    //Declare scratch variables:
    var logLam, logPreLamFac, logExpLamFac, expon, logExpon, denom, logDenom; //log
    //double preLamFac, expLamFac, expon, denom; //linear

    //for (int il = 0; il < numLams; il++){
    //lambda = lambda[il] * 1.0E-7;  // convert nm to cm
    //lambda = lambda * 1.0E-7; // convert nm to cm
    logLam = Math.log(lambda); // Do the call to log for lambda once //log
    //System.out.println("lambda " + lambda + " logLam " + logLam);

    logPreLamFac = logPreFac - 5.0 * logLam; //log
    logExpLamFac = logExpFac - logLam; //log
    //System.out.println("logPreLamFac " + logPreLamFac + " logExpLamFac " + logExpLamFac);
    // Be VERY careful about how we divide by lambda^5:
    //preLamFac = preFac / ( lambda * lambda ); //linear
    //preLamFac = preLamFac / ( lambda * lambda );  //linear
    //preLamFac = preLamFac / lambda;   //linear
    //expLamFac = expFac / lambda;

    //for (int id = 0; id < numDeps; id++){
    //logExpon = logExpLamFac - temp[1][id];
    logExpon = logExpLamFac - Math.log(temp); //log
    //System.out.println("temp " + temp + " logTemp " + Math.log(temp));
    expon = Math.exp(logExpon); //log
    //System.out.println("logExpon " + logExpon + " expon " + expon + " denom " + denom);
    // expon = expLamFac / temp;  //linear
    denom = Math.exp(expon);
    denom = denom - 1.0;
    logDenom = Math.log(denom); //log

    //BBlam[1][id][il] = logPreLamFac - logDenom;
    //BBlam[0][id][il] = Math.exp(BBlam[1][id][il]);
    logBBlam = logPreLamFac - logDenom; //log
    // Not needed? BBlam = Math.exp(logBBlam);  //log
    //BBlam = preLamFac / denom;  //linear

    // } //id loop - depths
    // } //il loop - lambdas
    return logBBlam;
};

// Computes the first partial derivative of B(T) wrt T, dB/dT:
var dBdT = function(temp, lambda) {

    var logdBdTlam;

    var c = 2.9979249E+10; // light speed in vaccuum in cm/s
    var k = 1.3806488E-16; // Boltzmann constant in ergs/K
    var h = 6.62606957E-27; //Planck's constant in ergs sec
    var logC = Math.log(c);
    var logK = Math.log(k);
    var logH = Math.log(h);

    var logPreFac = Math.log(2.0) + logH + 2.0 * logC;  //log
    var logExpFac = logH + logC - logK;      //log

    //Declare scratch variables:
    var logLam, logTemp, logPreLamFac, logExpLamFac, expon, logExpon, eTerm, denom, logDenom;  //log

    //lambda = lambda * 1.0E-7;  // convert nm to cm
    logLam = Math.log(lambda); // Do the call to log for lambda once //log
    logTemp = Math.log(temp);

    logPreLamFac = logPreFac + logExpFac - 6.0 * logLam - 2.0 * logTemp;  //log

    logExpLamFac = logExpFac - logLam;    //log

    //This is very subtle and dangerous!
    logExpon = logExpLamFac - logTemp;  // log of hc/kTlambda
    expon = Math.exp(logExpon);  // hc/kTlambda

    eTerm = Math.exp(expon); // e^hc/ktlambda
    denom = eTerm - 1.0; // e^hc/ktlambda - 1
    logDenom = Math.log(denom); // log(e^hc/ktlambda - 1)


    logdBdTlam = logPreLamFac + expon - 2.0 * logDenom;  //log

    return logdBdTlam;
};

// For some weird reason, JavaScript does not line the function name flux()!!! - Change to flux2()

var flux2 = function(intens, cosTheta) {

    var fluxSurfSpec = [];
    fluxSurfSpec.length = 2;
    // returns surface flux as a 2XnumLams vector
    //  - Row 0 linear flux (cgs units)
    //  - Row 1 log_e flux
    //  cosTheta is a 2xnumThetas array:
    // row 0 is used for Gaussian quadrature weights
    // row 1 is used for cos(theta) values
    // Gaussian quadrature:
    // Number of angles, numThetas, will have to be determined after the fact


    var numThetas = cosTheta[0].length;
    //var numThetas = 11;

    var flx = 0.0;
    for (var it = 0; it < numThetas; it++) {

        flx = flx + intens[it] * cosTheta[1][it] * cosTheta[0][it];
        //flx = 1.E14;  //debug
    }  // it - theta loop

    fluxSurfSpec[0] = 2.0 * Math.PI * flx;
    fluxSurfSpec[1] = Math.log(fluxSurfSpec[0]);
    //DEBUG: fluxSurfSpec[0] = 1.0E14;
    //DEBUG: fluxSurfSpec[1] = 14.0;

    return fluxSurfSpec;
};



/**
 * First, reality check raw colours, THEN Run Vega model and subtract off Vega
 * colours for single-point calibration
 */
var UBVRI = function(lambdaScale, flux, numDeps, tauRos, temp) {

    var filters = filterSet();

    var numCols = 5;  //five band combinations in Johnson-Bessell UxBxBVRI: Ux-Bx, B-V, V-R, V-I, R-I
    var colors = [];
    colors.length = numCols;

    var numBands = filters.length;
    var numLambdaFilt;

    var bandFlux = [];
    bandFlux.length = numBands;


    // Single-point calibration to Vega:
    // Vega colours computed self-consistntly with GrayFox 1.0 using 
    // Stellar parameters of Castelli, F.; Kurucz, R. L., 1994, A&A, 281, 817
    // Teff = 9550 K, log(g) = 3.95, ([Fe/H] = -0.5 - not directly relevent):

    //var vegaColors = [0.0, 0.0, 0.0, 0.0, 0.0]; //For re-calibrating with raw Vega colours
    // Aug 2015 - with 14-line linelist:
    //var vegaColors = [0.289244, -0.400324, 0.222397, -0.288568, -0.510965];
    var vegaColors = [0.163003, -0.491341, 0.161940, -0.464265, -0.626204];

    var deltaLam, newY, product;

    for (var ib = 0; ib < numBands; ib++) {

        bandFlux[ib] = 0.0; //initialization
        numLambdaFilt = filters[ib][0].length;
        //console.log("ib " + ib + " numLambdaFilt " + numLambdaFilt);
        //wavelength loop is over photometric filter data wavelengths

        for (var il = 1; il < numLambdaFilt; il++) {

            //In this case - interpolate model SED onto wavelength grid of given photometric filter data

            deltaLam = filters[ib][0][il] - filters[ib][0][il - 1];  //nm
            //deltaLam = 1.0e-7 * deltaLam;  //cm
            //console.log("ib: " + ib + " il: " + il + " filters[ib][0][il] " + filters[ib][0][il] + " deltaLam: " + deltaLam + " filters[ib][1][il] " + filters[ib][1][il]);

            //hand log flux (row 1) to interpolation routine: 
            newY = interpol(lambdaScale, flux[1], filters[ib][0][il]);
            // linearize interpolated flux: - fluxes add *linearly*
            newY = Math.exp(newY);

            product = filters[ib][1][il] * newY;
            if (ib === 2) {
                //console.log("Photometry: il: " + il + " newY: " + newY + " filterLamb: " + filters[ib][0][il] + " filterTrans: " + filters[ib][1][il] + " product " + product);
            }
            //System.out.println("Photometry: filtertrans: " + filters[ib][1][il] + " product: " + product + " deltaLam: " + deltaLam);
            //Rectangular picket integration
            bandFlux[ib] = bandFlux[ib] + (product * deltaLam);
            //console.log("Photometry: ib: " + ib + " deltaLam " + deltaLam + " bandFlux: " + bandFlux[ib]);

        } //il loop - lambdas
        //console.log("Photometry: ib: " + ib + " bandFlux: " + bandFlux[ib], " product " + product + " deltaLam " + deltaLam);

    }  //ib loop - bands

    var raw;

    // Ux-Bx: 
    raw = 2.5 * logTen(bandFlux[1] / bandFlux[0]);
    colors[0] = raw - vegaColors[0];
    //console.log("U-B: " + colors[0] + " raw " + raw + " bandFlux[1] " + bandFlux[1] + " bandFlux[0] " + bandFlux[0]);

    // B-V:
    raw = 2.5 * logTen(bandFlux[3] / bandFlux[2]);
    colors[1] = raw - vegaColors[1];
    //console.log("B-V: " + colors[1]);

    // V-R:
    raw = 2.5 * logTen(bandFlux[4] / bandFlux[3]);
    colors[2] = raw - vegaColors[2];
    //console.log("V-R: " + colors[2]);

    // V-I:
    raw = 2.5 * logTen(bandFlux[5] / bandFlux[3]);
    colors[3] = raw - vegaColors[3];
    //console.log("V-I: " + colors[3]);

    // R-I:
    raw = 2.5 * logTen(bandFlux[5] / bandFlux[4]);
    colors[4] = raw - vegaColors[4];
    //console.log("R-I: " + colors[4]);

    return colors;

}; //UBVRI

//
//

var iColors = function(lambdaScale, intens, numDeps, numThetas, numLams, tauRos, temp) {
    //No! iColors now returns band-integrated intensities

    var filters = filterSet();
    var numCols = 5; //five band combinations in Johnson-Bessell UxBxBVRI: Ux-Bx, B-V, V-R, V-I, R-I

    var numBands = filters.length;
    var numLambdaFilt = filters[0][0].length;

    //var colors = [];
    //colors.length = numCols;
    //// Have to use Array constructor here:
    //for (var i = 0; i < numCols; i++) {
    //    colors[i] = new Array(numThetas);
    //}


    var bandIntens = [];
    bandIntens.length = numBands;
    // Have to use Array constructor here:
    for (var i = 0; i < numBands; i++) {
        bandIntens[i] = new Array(numThetas);
    }


//Unnecessary:
//Note: Calibration must be re-done!  May 2015
// Single-point Johnson UBVRI calibration to Vega:
// Vega colours computed self-consistntly with GrayFox 1.0 using 
// Stellar parameters of Castelli, F.; Kurucz, R. L., 1994, A&A, 281, 817
// Teff = 9550 K, log(g) = 3.95, ([Fe/H] = -0.5 - not directly relevent):
    var vegaColors = [0.163003, -0.491341, 0.161940, -0.464265, -0.626204];

    var deltaLam, newY, product, raw;
    var intensLam = [];
    intensLam.length = numLams;

    //Now same for each intensity spectrum:
    for (var it = 0; it < numThetas; it++) {

//Caution: This loop is over *model SED* lambdas!
        for (var jl = 0; jl < numLams; jl++) {
            intensLam[jl] = intens[jl][it];
            //System.out.println("it: " + it + " jl: " + jl + " intensLam[jl]: " + intensLam[jl]);
        }

        for (var ib = 0; ib < numBands; ib++) {

            bandIntens[ib][it] = 0.0; //initialization

//wavelength loop is over photometric filter data wavelengths

            for (var il = 1; il < numLambdaFilt; il++) {

//In this case - interpolate model SED onto wavelength grid of given photometric filter data

                deltaLam = filters[ib][0][il] - filters[ib][0][il - 1]; //nm
                //deltaLam = 1.0e-7 * deltaLam; //cm
                //hand log flux (row 1) to interpolation routine: 
                newY = interpol(lambdaScale, intensLam, filters[ib][0][il]);
                //System.out.println("Photometry: newFlux: " + newFlux + " filterlamb: " + filters[ib][0][il]);
                product = filters[ib][1][il] * newY;
                //System.out.println("Photometry: filtertrans: " + filters[ib][1][il] + " product: " + product + " deltaLam: " + deltaLam);
                //Rectangular picket integration
                bandIntens[ib][it] = bandIntens[ib][it] + (product * deltaLam);
                //console.log("Photometry: ib: " + ib + " bandIntens: " + bandIntens[ib][it]);
            } //il wavelength loop

//System.out.println("Photometry: ib: " + ib + " it: " + it + " bandIntens: " + bandIntens[ib][it]);
        }  //ib band loop

        //necessary
        //Make the colors! :-)
        //console.log("it: " + it);

        // Ux-Bx: 
        //raw = 2.5 * logTen(bandIntens[1][it] / bandIntens[0][it]);
        //colors[0][it] = raw - vegaColors[0];
        //console.log("U-B: " + colors[0][it]);

        // B-V:
        //raw = 2.5 * logTen(bandIntens[3][it] / bandIntens[2][it]);
        //colors[1][it] = raw - vegaColors[1];
        //console.log("B-V: " + colors[1][it]);

        // V-R:
        //raw = 2.5 * logTen(bandIntens[4][it] / bandIntens[3][it]);
        //colors[2][it] = raw - vegaColors[2];
        //console.log("V-R: " + colors[2][it]);

        // V-I:
        // raw = 2.5 * logTen(bandIntens[5][it] / bandIntens[3][it]);
        //colors[3][it] = raw - vegaColors[3];
        //console.log("V-I: " + colors[3][it]);

        // R-I:
        //raw = 2.5 * logTen(bandIntens[5][it] / bandIntens[4][it]);
        //colors[4][it] = raw - vegaColors[4];
        //console.log("R-I: " + colors[4][it]);
        //necessary

    } //theta it loop

    //return colors;
    return bandIntens;

}; //iColours

//
//

var filterSet = function() {

    var numBands = 6; // Bessell-Johnson UxBxBVRI
    var numLambdaFilt = 25; //test for now

    //double[][][] filterCurves = new double[numBands][2][numLambdaFilt];

    var filterCurves = [];
    filterCurves.length = numBands;
    // Have to use Array constructor here:
    for (var i = 0; i < numBands; i++) {
        filterCurves[i] = new Array(2);
    }
    // Have to use Array constructor here:
    for (var i = 0; i < numBands; i++) {
        filterCurves[i][0] = new Array(numLambdaFilt);
        filterCurves[i][1] = new Array(numLambdaFilt);
    }

    //Initialize all filterCurves - the real data below won't fill in all the array elements:
    for (var ib = 0; ib < numBands; ib++) {
        for (var il = 0; il < numLambdaFilt; il++) {
            filterCurves[ib][0][il] = 1000.0; //placeholder wavelength (nm)
            filterCurves[ib][1][il] = 0.0e0; // initialize filter transparency to 0.0
        }
    }

    //http://ulisse.pd.astro.it/Astro/ADPS/Systems/Sys_136/index_136.html
//Bessell, M. S., 1990, PASP, 102, 1181
//photometric filter data for Bessell UxBxBVRI system from Asiago database in Java & JavaScript syntax
//Individual bands are below master table
//        UX
    filterCurves[0][0][0] = 300.0;
    filterCurves[0][1][0] = 0.000;
    filterCurves[0][0][1] = 305.0;
    filterCurves[0][1][1] = 0.016;
    filterCurves[0][0][2] = 310.0;
    filterCurves[0][1][2] = 0.068;
    filterCurves[0][0][3] = 315.0;
    filterCurves[0][1][3] = 0.167;
    filterCurves[0][0][4] = 320.0;
    filterCurves[0][1][4] = 0.287;
    filterCurves[0][0][5] = 325.0;
    filterCurves[0][1][5] = 0.423;
    filterCurves[0][0][6] = 330.0;
    filterCurves[0][1][6] = 0.560;
    filterCurves[0][0][7] = 335.0;
    filterCurves[0][1][7] = 0.673;
    filterCurves[0][0][8] = 340.0;
    filterCurves[0][1][8] = 0.772;
    filterCurves[0][0][9] = 345.0;
    filterCurves[0][1][9] = 0.841;
    filterCurves[0][0][10] = 350.0;
    filterCurves[0][1][10] = 0.905;
    filterCurves[0][0][11] = 355.0;
    filterCurves[0][1][11] = 0.943;
    filterCurves[0][0][12] = 360.0;
    filterCurves[0][1][12] = 0.981;
    filterCurves[0][0][13] = 365.0;
    filterCurves[0][1][13] = 0.993;
    filterCurves[0][0][14] = 370.0;
    filterCurves[0][1][14] = 1.000;
    filterCurves[0][0][15] = 375.0;
    filterCurves[0][1][15] = 0.989;
    filterCurves[0][0][16] = 380.0;
    filterCurves[0][1][16] = 0.916;
    filterCurves[0][0][17] = 385.0;
    filterCurves[0][1][17] = 0.804;
    filterCurves[0][0][18] = 390.0;
    filterCurves[0][1][18] = 0.625;
    filterCurves[0][0][19] = 395.0;
    filterCurves[0][1][19] = 0.423;
    filterCurves[0][0][20] = 400.0;
    filterCurves[0][1][20] = 0.238;
    filterCurves[0][0][21] = 405.0;
    filterCurves[0][1][21] = 0.114;
    filterCurves[0][0][22] = 410.0;
    filterCurves[0][1][22] = 0.051;
    filterCurves[0][0][23] = 415.0;
    filterCurves[0][1][23] = 0.019;
    filterCurves[0][0][24] = 420.0;
    filterCurves[0][1][24] = 0.000;
//BX
    filterCurves[1][0][0] = 360.0;
    filterCurves[1][1][0] = 0.000;
    filterCurves[1][0][1] = 370.0;
    filterCurves[1][1][1] = 0.026;
    filterCurves[1][0][2] = 380.0;
    filterCurves[1][1][2] = 0.120;
    filterCurves[1][0][3] = 390.0;
    filterCurves[1][1][3] = 0.523;
    filterCurves[1][0][4] = 400.0;
    filterCurves[1][1][4] = 0.875;
    filterCurves[1][0][5] = 410.0;
    filterCurves[1][1][5] = 0.956;
    filterCurves[1][0][6] = 420.0;
    filterCurves[1][1][6] = 1.000;
    filterCurves[1][0][7] = 430.0;
    filterCurves[1][1][7] = 0.998;
    filterCurves[1][0][8] = 440.0;
    filterCurves[1][1][8] = 0.972;
    filterCurves[1][0][9] = 450.0;
    filterCurves[1][1][9] = 0.901;
    filterCurves[1][0][10] = 460.0;
    filterCurves[1][1][10] = 0.793;
    filterCurves[1][0][11] = 470.0;
    filterCurves[1][1][11] = 0.694;
    filterCurves[1][0][12] = 480.0;
    filterCurves[1][1][12] = 0.587;
    filterCurves[1][0][13] = 490.0;
    filterCurves[1][1][13] = 0.470;
    filterCurves[1][0][14] = 500.0;
    filterCurves[1][1][14] = 0.362;
    filterCurves[1][0][15] = 510.0;
    filterCurves[1][1][15] = 0.263;
    filterCurves[1][0][16] = 520.0;
    filterCurves[1][1][16] = 0.169;
    filterCurves[1][0][17] = 530.0;
    filterCurves[1][1][17] = 0.107;
    filterCurves[1][0][18] = 540.0;
    filterCurves[1][1][18] = 0.049;
    filterCurves[1][0][19] = 550.0;
    filterCurves[1][1][19] = 0.010;
    filterCurves[1][0][20] = 560.0;
    filterCurves[1][1][20] = 0.000;
    filterCurves[1][0][21] = 560.0;
    filterCurves[1][1][21] = 0.000;
    filterCurves[1][0][22] = 560.0;
    filterCurves[1][1][22] = 0.000;
    filterCurves[1][0][23] = 560.0;
    filterCurves[1][1][23] = 0.000;
    filterCurves[1][0][24] = 560.0;
    filterCurves[1][1][24] = 0.000;
//B
    filterCurves[2][0][0] = 360.0;
    filterCurves[2][1][0] = 0.000;
    filterCurves[2][0][1] = 370.0;
    filterCurves[2][1][1] = 0.030;
    filterCurves[2][0][2] = 380.0;
    filterCurves[2][1][2] = 0.134;
    filterCurves[2][0][3] = 390.0;
    filterCurves[2][1][3] = 0.567;
    filterCurves[2][0][4] = 400.0;
    filterCurves[2][1][4] = 0.920;
    filterCurves[2][0][5] = 410.0;
    filterCurves[2][1][5] = 0.978;
    filterCurves[2][0][6] = 420.0;
    filterCurves[2][1][6] = 1.000;
    filterCurves[2][0][7] = 430.0;
    filterCurves[2][1][7] = 0.978;
    filterCurves[2][0][8] = 440.0;
    filterCurves[2][1][8] = 0.935;
    filterCurves[2][0][9] = 450.0;
    filterCurves[2][1][9] = 0.853;
    filterCurves[2][0][10] = 460.0;
    filterCurves[2][1][10] = 0.740;
    filterCurves[2][0][11] = 470.0;
    filterCurves[2][1][11] = 0.640;
    filterCurves[2][0][12] = 480.0;
    filterCurves[2][1][12] = 0.536;
    filterCurves[2][0][13] = 490.0;
    filterCurves[2][1][13] = 0.424;
    filterCurves[2][0][14] = 500.0;
    filterCurves[2][1][14] = 0.325;
    filterCurves[2][0][15] = 510.0;
    filterCurves[2][1][15] = 0.235;
    filterCurves[2][0][16] = 520.0;
    filterCurves[2][1][16] = 0.150;
    filterCurves[2][0][17] = 530.0;
    filterCurves[2][1][17] = 0.095;
    filterCurves[2][0][18] = 540.0;
    filterCurves[2][1][18] = 0.043;
    filterCurves[2][0][19] = 550.0;
    filterCurves[2][1][19] = 0.009;
    filterCurves[2][0][20] = 560.0;
    filterCurves[2][1][20] = 0.000;
    filterCurves[2][0][21] = 560.0;
    filterCurves[2][1][21] = 0.000;
    filterCurves[2][0][22] = 560.0;
    filterCurves[2][1][22] = 0.000;
    filterCurves[2][0][23] = 560.0;
    filterCurves[2][1][23] = 0.000;
    filterCurves[2][0][24] = 560.0;
    filterCurves[2][1][24] = 0.000;
//V
    filterCurves[3][0][0] = 470.0;
    filterCurves[3][1][0] = 0.000;
    filterCurves[3][0][1] = 480.0;
    filterCurves[3][1][1] = 0.030;
    filterCurves[3][0][2] = 490.0;
    filterCurves[3][1][2] = 0.163;
    filterCurves[3][0][3] = 500.0;
    filterCurves[3][1][3] = 0.458;
    filterCurves[3][0][4] = 510.0;
    filterCurves[3][1][4] = 0.780;
    filterCurves[3][0][5] = 520.0;
    filterCurves[3][1][5] = 0.967;
    filterCurves[3][0][6] = 530.0;
    filterCurves[3][1][6] = 1.000;
    filterCurves[3][0][7] = 540.0;
    filterCurves[3][1][7] = 0.973;
    filterCurves[3][0][8] = 550.0;
    filterCurves[3][1][8] = 0.898;
    filterCurves[3][0][9] = 560.0;
    filterCurves[3][1][9] = 0.792;
    filterCurves[3][0][10] = 570.0;
    filterCurves[3][1][10] = 0.684;
    filterCurves[3][0][11] = 580.0;
    filterCurves[3][1][11] = 0.574;
    filterCurves[3][0][12] = 590.0;
    filterCurves[3][1][12] = 0.461;
    filterCurves[3][0][13] = 600.0;
    filterCurves[3][1][13] = 0.359;
    filterCurves[3][0][14] = 610.0;
    filterCurves[3][1][14] = 0.270;
    filterCurves[3][0][15] = 620.0;
    filterCurves[3][1][15] = 0.197;
    filterCurves[3][0][16] = 630.0;
    filterCurves[3][1][16] = 0.135;
    filterCurves[3][0][17] = 640.0;
    filterCurves[3][1][17] = 0.081;
    filterCurves[3][0][18] = 650.0;
    filterCurves[3][1][18] = 0.045;
    filterCurves[3][0][19] = 660.0;
    filterCurves[3][1][19] = 0.025;
    filterCurves[3][0][20] = 670.0;
    filterCurves[3][1][20] = 0.017;
    filterCurves[3][0][21] = 680.0;
    filterCurves[3][1][21] = 0.013;
    filterCurves[3][0][22] = 690.0;
    filterCurves[3][1][22] = 0.009;
    filterCurves[3][0][23] = 700.0;
    filterCurves[3][1][23] = 0.000;
    filterCurves[3][0][24] = 700.0;
    filterCurves[3][1][24] = 0.000;
//R
    filterCurves[4][0][0] = 550.0;
    filterCurves[4][1][0] = 0.00;
    filterCurves[4][0][1] = 560.0;
    filterCurves[4][1][1] = 0.23;
    filterCurves[4][0][2] = 570.0;
    filterCurves[4][1][2] = 0.74;
    filterCurves[4][0][3] = 580.0;
    filterCurves[4][1][3] = 0.91;
    filterCurves[4][0][4] = 590.0;
    filterCurves[4][1][4] = 0.98;
    filterCurves[4][0][5] = 600.0;
    filterCurves[4][1][5] = 1.00;
    filterCurves[4][0][6] = 610.0;
    filterCurves[4][1][6] = 0.98;
    filterCurves[4][0][7] = 620.0;
    filterCurves[4][1][7] = 0.96;
    filterCurves[4][0][8] = 630.0;
    filterCurves[4][1][8] = 0.93;
    filterCurves[4][0][9] = 640.0;
    filterCurves[4][1][9] = 0.90;
    filterCurves[4][0][10] = 650.0;
    filterCurves[4][1][10] = 0.86;
    filterCurves[4][0][11] = 660.0;
    filterCurves[4][1][11] = 0.81;
    filterCurves[4][0][12] = 670.0;
    filterCurves[4][1][12] = 0.78;
    filterCurves[4][0][13] = 680.0;
    filterCurves[4][1][13] = 0.72;
    filterCurves[4][0][14] = 690.0;
    filterCurves[4][1][14] = 0.67;
    filterCurves[4][0][15] = 700.0;
    filterCurves[4][1][15] = 0.61;
    filterCurves[4][0][16] = 710.0;
    filterCurves[4][1][16] = 0.56;
    filterCurves[4][0][17] = 720.0;
    filterCurves[4][1][17] = 0.51;
    filterCurves[4][0][18] = 730.0;
    filterCurves[4][1][18] = 0.46;
    filterCurves[4][0][19] = 740.0;
    filterCurves[4][1][19] = 0.40;
    filterCurves[4][0][20] = 750.0;
    filterCurves[4][1][20] = 0.35;
    filterCurves[4][0][21] = 800.0;
    filterCurves[4][1][21] = 0.14;
    filterCurves[4][0][22] = 850.0;
    filterCurves[4][1][22] = 0.03;
    filterCurves[4][0][23] = 900.0;
    filterCurves[4][1][23] = 0.00;
    filterCurves[4][0][24] = 900.0;
    filterCurves[4][1][24] = 0.000;

//I
    filterCurves[5][0][0] = 700.0;
    filterCurves[5][1][0] = 0.000;
    filterCurves[5][0][1] = 710.0;
    filterCurves[5][1][1] = 0.024;
    filterCurves[5][0][2] = 720.0;
    filterCurves[5][1][2] = 0.232;
    filterCurves[5][0][3] = 730.0;
    filterCurves[5][1][3] = 0.555;
    filterCurves[5][0][4] = 740.0;
    filterCurves[5][1][4] = 0.785;
    filterCurves[5][0][5] = 750.0;
    filterCurves[5][1][5] = 0.910;
    filterCurves[5][0][6] = 760.0;
    filterCurves[5][1][6] = 0.965;
    filterCurves[5][0][7] = 770.0;
    filterCurves[5][1][7] = 0.985;
    filterCurves[5][0][8] = 780.0;
    filterCurves[5][1][8] = 0.990;
    filterCurves[5][0][9] = 790.0;
    filterCurves[5][1][9] = 0.995;
    filterCurves[5][0][10] = 800.0;
    filterCurves[5][1][10] = 1.000;
    filterCurves[5][0][11] = 810.0;
    filterCurves[5][1][11] = 1.000;
    filterCurves[5][0][12] = 820.0;
    filterCurves[5][1][12] = 0.990;
    filterCurves[5][0][13] = 830.0;
    filterCurves[5][1][13] = 0.980;
    filterCurves[5][0][14] = 840.0;
    filterCurves[5][1][14] = 0.950;
    filterCurves[5][0][15] = 850.0;
    filterCurves[5][1][15] = 0.910;
    filterCurves[5][0][16] = 860.0;
    filterCurves[5][1][16] = 0.860;
    filterCurves[5][0][17] = 870.0;
    filterCurves[5][1][17] = 0.750;
    filterCurves[5][0][18] = 880.0;
    filterCurves[5][1][18] = 0.560;
    filterCurves[5][0][19] = 890.0;
    filterCurves[5][1][19] = 0.330;
    filterCurves[5][0][20] = 900.0;
    filterCurves[5][1][20] = 0.150;
    filterCurves[5][0][21] = 910.0;
    filterCurves[5][1][21] = 0.030;
    filterCurves[5][0][22] = 920.0;
    filterCurves[5][1][22] = 0.000;
    filterCurves[5][0][23] = 920.0;
    filterCurves[5][1][23] = 0.000;
    filterCurves[5][0][24] = 920.0;
    filterCurves[5][1][24] = 0.000;
    //
    //Check that we set up the array corectly:
//    for (var ib = 0; ib < numBands; ib++) {
//    var ib = 0;
//    for (var il = 0; il < numLambdaFilt; il++) {
//        console.log("ib: " + ib + " il: " + il + " filterCurves[ib][0][il]: " + filterCurves[0][0][il]);
//       console.log("ib: " + ib + " il: " + il + " filterCurves[ib][1][il]: " + filterCurves[0][1][il]);
//   }
//    }

    for (var ib = 0; ib < numBands; ib++) {
//wavelength loop is over photometric filter data wavelengths
        for (var il = 0; il < numLambdaFilt; il++) {
            filterCurves[ib][0][il] = filterCurves[ib][0][il] * 1.0e-7; // nm to cm
        }
    }


    return filterCurves;
}; //filterSet



