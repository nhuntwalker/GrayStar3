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
var GConst = 6.674e-8; //Newton's gravitational constant (cgs)
//Conversion factors
var amu = 1.66053892E-24; // atomic mass unit in g
var eV = 1.602176565E-12; // eV in ergs
var rSun = 6.955e10; // solar radii to cm
var mSun = 1.9891e33; // solar masses to g
var lSun = 3.846e33; // solar bolometric luminosities to ergs/s

//Methods:
//Natural logs more useful than base 10 logs - Eg. Formal soln module: 
// Fundamental constants
var logC = Math.log(c);
var logSigma = Math.log(sigma);
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
// ********************************************

// *********************************************************
// 
// 
// Atmosphere astrophysical functions:
//

//log_10 Rosseland optical depth scale  
// CAUTION: Here tau[1][] is log_10!
var tauScale = function(numDeps, log10MinDepth, log10MaxDepth) {

//log_10 Rosseland optical depth scale  
//Java: double tauRos[][] = new double[2][numDeps];
//var tauRos = new double[2][numDeps];
    var dummy0 = [];
    var dummy1 = [];
    dummy0.length = numDeps;
    dummy1.length = numDeps;
    var tauRos = [
        dummy0,
        dummy1
    ];
    // Construct the log Rosseland optical depth scale:
    // Try equal spacing in log depth

    var ln10 = Math.log(10.0);
    //   var log10MinDepth = -6.0;
    //   var log10MaxDepth = 2.0;
    var logMinDepth = log10MinDepth * ln10;
    var logMaxDepth = log10MaxDepth * ln10;
    var deltaLogTau = (logMaxDepth - logMinDepth) / (numDeps - 1.0);
    var ii;
    for (var i = 0; i < numDeps; i++) {

        ii = i * 1.0;
        //Java: tauRos[1][i] = logMinDepth + ii * deltaLogTau;
        //Java: tauRos[0][i] = Math.exp(tauRos[1][i]);
        tauRos[1][i] = logMinDepth + ii * deltaLogTau;
        tauRos[0][i] = Math.exp(tauRos[1][i]);
    }

    return tauRos;
};
/**
 * Computes the Gray kinetic temperature structure, on the Rosseland optical
 * depth scale T_kin(Tau_Ros) = Teff * (0.75Tau_Ros + Hopf)^0.25
 */
var temperature = function(numDeps, teff, tauRos) {

    //Gray kinetic temeprature structure:
    // Java:double[][] temp = new double[2][numDeps];
    var dummy0 = [];
    var dummy1 = [];
    dummy0.length = numDeps;
    dummy1.length = numDeps;
    var temp = [
        dummy0,
        dummy1
    ];
    var hopf, deltaLogTau;
    for (var i = 0; i < numDeps; i++) {

        // Interpolate approximate Hopf function:
        deltaLogTau = (tauRos[1][i] - tauRos[1][0]) / (tauRos[1][numDeps - 1] - tauRos[1][0]);
        hopf = 0.55 + deltaLogTau * (0.710 - 0.55);
        //temp[1][i] = Math.log(teff) + 
        //             0.25 * Math.log(0.75*tauRos[0][i] + 0.5);
        temp[1][i] = Math.log(teff)
                + 0.25 * Math.log(0.75 * (tauRos[0][i] + hopf));
        temp[0][i] = Math.exp(temp[1][i]);
    }

    return temp;
};
/**
 * Compute Rosseland mean extinction coefficient (cm^2/g) structure by scaling
 * from Sun
 *
 */
//var kappas = function(numDeps, kappaScale, tauRos, temp, tempSun, logg, loggSun, teff) {
var kappas = function(mode, numDeps, rho, rhoSun, kappaRosSun, kappaScale, logg, loggSun, teff, teffSun,
        radius, massX, massZ, tauRos, temp, tempSun, logNumsH3, logNumsH2) {

    var logE = logTen(Math.E); // for debug output
    var GConst = 6.674e-8; //Newton's gravitational constant (cgs)
    var logGConst = Math.log(GConst);
    var rSun = 6.955e10; // solar radii to cm
    var logRSun = Math.log(rSun);
    var hotT = 6000.0; //hotter than this in K and we use hot star formula
    // if (mode === 1) {
    //     if (teff < hotT) {
    //        window.alert("Teff < 6000 K: cool opacity with H-minus");
    //     } else {
    //         window.alert("Teff > 6000 K: hot opacity withOUT H-minus");
    //     }
    // }
//var hotT = 5000.0;  //debug test
// Need solar vertical Kappa_Ross structure here:
// log(kappa_Ros) structure based on Table 9.2 of Observation
// and Analysis of Stellar Photospheres, 3rd Ed., D.F. Gray:
    var dummy0 = [];
    var dummy1 = [];
    dummy0.length = numDeps;
    dummy1.length = numDeps;
    //var logRadius = Math.log(radius);
    var logRadiusSun = 0.0; //solar units
    var massZSun = 0.02;
    var dilute, rhoStarFake, rhoSunFake;
    var logRhoStarFake = 0.0; //enforced initialization
    var logRhoSunFake = 0.0; //enforced initialization

    if (mode === 0) {
// Approximate mass density in atmosphere by scaling with logg and radius, then diluting:
        var dilute = 5.0e-5; //tuned to give rho ~10^-1 g/cm^-3 in Sun's atmosphere
        var logRhoStarFake = Math.log(3.0 / 4.0 / Math.PI) - logGConst + logg - Math.log(rSun * radius);
        var rhoStarFake = dilute * Math.exp(logRhoStarFake);
        // Do the same for Sun for consistency
        var logRhoSunFake = Math.log(3.0 / 4.0 / Math.PI) - logGConst + loggSun - logRSun;
        var rhoSunFake = dilute * Math.exp(logRhoSunFake);
    }
    var kappa = [dummy0, dummy1];
    /*
     var kappaRosSun = [dummy0, dummy1];
     var minLog10KappaRosSun = -3.5;
     var maxLog10KappaRosSun = 2.0;
     var ln10 = Math.log(10.0);
     var minLogKappaRosSun = minLog10KappaRosSun * ln10;
     var maxLogKappaRosSun = maxLog10KappaRosSun * ln10;
     var deltaKappa = (maxLogKappaRosSun - minLogKappaRosSun) / numDeps;
     var ii;
     //Sun:
     for (var i = 0; i < numDeps; i++) {
     
     ii = 1.0 * i;
     kappaRosSun[1][i] = minLogKappaRosSun + ii * deltaKappa;
     kappaRosSun[0][i] = Math.exp(kappaRosSun[1][i]);
     }
     */

    //Star:
    var numerator;
    var denominator;
    var logHelp, help, reScale, logNH3, logNH2;
    reScale = 1.0 * kappaScale;
    for (var i = 0; i < numDeps; i++) {
        logNH3 = logNumsH3[2][i];
        logNH2 = logNumsH2[2][i];
// No!  According to ATLAS9 ABROSS values, kappa almost independent of logg - !?

        if (mode === 0) {
            numerator = kappaFac(numDeps, hotT, logRhoStarFake, temp[1][i], massX, massZ, logNH3, logNH2);
            denominator = kappaFac(numDeps, hotT, logRhoSunFake, tempSun[1][i], massX, massZSun, logNH3, logNH2);
        } else if (mode === 1) {
            numerator = kappaFac(numDeps, hotT, rho[1][i], temp[1][i], massX, massZ, logNH3, logNH2);
            denominator = kappaFac(numDeps, hotT, rhoSun[1][i], tempSun[1][i], massX, massZSun, logNH3, logNH2);
        }

        kappa[0][i] = reScale * kappaRosSun[0][i] * (numerator / denominator);
        kappa[1][i] = Math.log(kappa[0][i]);
        //console.log("i " + i + " kappa[1] " + logE * kappa[1][i]);
    }

    return kappa;
};
var kappaFac = function(numDeps, hotT, logRho, logTemp, massX, massZ, logNH3, logNH2) {

    var logE = Math.log10(Math.E); // for debug output

    var kapFac = 0.0;
    // These values tuned to produce total kappas of right order of magnitude
    var constbf = 2.34e19; // b-f pre-factor cm^2/g
    var constff = 3.68e15; // f-f pre-factor cm^2/g
    var constes = 0.2; // Thomson scattering from free electron pre-factor cm^2/g
    var constHm = 3.9e-31 / 0.02; // H^- b-f pre-factor with 1/0.02 factor from Z term cm^2/g
    //should b-b opacity rho-and T- scaling track b-f oapcity?
    var sigmabf = 1.31e-15; // Hydrogen b-f x-section, cm^-2
    var refLambda = 500.0; //reference lambda in nm for HI bf opacity formula   

    // Paschen continuum H I opacity from n=3:
    var n3 = 3.0;
    var lamJump3 = 820.4; //Paschen jump in nm
    var logHbfFac3 = Math.log(sigmabf) - 5.0 * n3 + 3.0 * (Math.log(lamJump3) - Math.log(refLambda));
    //double hbfFac = Math.pow(lamJump / refLambda, 3.0) / Math.pow(n, 5);
    // Paschen continuum H I opacity from n=3:
    var n2 = 2.0;
    var lamJump2 = 364.0; //Paschen jump in nm
    var logHbfFac2 = Math.log(sigmabf) - 5.0 * n2 + 3.0 * (Math.log(lamJump2) - Math.log(refLambda));

    var logRhoT35, rhoT35;
    var logHmTerm, HmTerm, HmTermHot, HmHotFac;
    var logHIbfTerm3, logHIbfTerm2, HIbfTerm;
    var thisTemp = Math.exp(logTemp);

    logRhoT35 = logRho - 3.5 * logTemp;
    rhoT35 = Math.exp(logRhoT35);

    logHmTerm = Math.log(constHm) + Math.log(massZ) + 0.5 * logRho + 9.0 * logTemp; // H^- b-f term
    HmTerm = Math.exp(logHmTerm);
    var midRange = 1500.0;  //H^- opacity ramp-down T range

    if (thisTemp < hotT) {
        // Caroll & Ostlie 2nd Ed. Ch. 9 - (1+X) factors do NOT cancel out when we divide kappa_Star/kappa_Sun
//            // Cool stars: kappa_bf + kappa_ff + kappa_H^- + kappa_es
        kapFac = rhoT35 * (1.0 + massX) * (constbf * massZ + constff * (1.0 - massZ)) + HmTerm + (1.0 + massX) * constes;
        // Cool stars: kappa_ff + kappa_H^- + kappa_es
        //kapFac = rhoT35 * (1.0 + massX) * (constff * (1.0 - massZ)) + HmTerm + (1.0 + massX) * constes;
        //console.log("Cool T: " + Math.exp(logTemp)
        //        + " b-f: " + logE * Math.log(rhoT35 * (1.0 + massX) * (constbf * massZ))
        //        + " f-f: " + logE * Math.log(rhoT35 * (1.0 + massX) * (constff * (1.0 - massZ)))
        //        + " H^-: " + logE * logHmTerm + " es: " + logE * Math.log((1.0 + massX) * constes)
        //        + " kapFac " + kapFac);
    }

    logHIbfTerm3 = logHbfFac3 + logNH3 - logRho;  //neglects stimualted emission (for now)
    logHIbfTerm2 = logHbfFac2 + logNH2 - logRho;  //neglects stimualted emission (for now)
    HIbfTerm = Math.exp(logHIbfTerm3) + Math.exp(logHIbfTerm2);

    if ((thisTemp >= hotT) && (thisTemp < (hotT + midRange))) {
        HmHotFac = 1.0 - ((thisTemp - hotT) / midRange);
        HmTermHot = HmTerm * Math.sqrt(HmHotFac);
        //console.log("HmHotFac: " + HmHotFac);
        kapFac = rhoT35 * (constbf * massZ + constff * (1.0 - massZ)) + constes + HIbfTerm + HmTermHot;
        //console.log("Middle T: " + Math.exp(logTemp) + " b-f: " + rhoT35 * (constbf * massZ)
        //        + " f-f: " + rhoT35 * (constff * (1.0 - massZ))
        //        + " es: " + constes + " HIbf: " + HIbfTerm + " HmTermHot: " + HmTermHot + " kapFac " + kapFac);
    }

    if (thisTemp >= (hotT + midRange)) {
        // Caroll & Ostlie 2nd Ed. Ch. 9 - (1+X) factors in every term will cancel out when we divide kappa_Star/kappa_Sun
        // Hot stars: kappa_bf + kappa_ff + kappa_es
        kapFac = rhoT35 * (constbf * massZ + constff * (1.0 - massZ)) + constes + HIbfTerm;
        //console.log("Hot T: " + Math.exp(logTemp) + " b-f: " + rhoT35 * (constbf * massZ)
        //        + " f-f: " + rhoT35 * (constff * (1.0 - massZ))
        //        + " es: " + constes + " kapFac " + kapFac);
    }

    return kapFac;
};
/**
 * Solve hydrostatic eq for P scale on the tau scale - need to pick a depth
 * dependent kappa value! - dP/dTau = g/kappa --> dP/dlogTau = Tau*g/kappa 
 * 
 * press is a 4 x numDeps array: rows 0 & 1 are linear and log *gas* pressure,
 * respectively rows 2 & 3 are linear and log *radiation* pressure Split
 * pressure into gas and radiation contributions as we calculate it:
 */
var hydrostatic = function(numDeps, grav, tauRos, kappa, temp) {

    var c = 2.9979249E+10; // light speed in vaccuum in cm/s
    var sigma = 5.670373E-5; //Stefan-Boltzmann constant ergs/s/cm^2/K^4  
    var logC = Math.log(c);
    var logSigma = Math.log(sigma);
    var radFac = Math.log(4.0) + logSigma - Math.log(3.0) - logC;
    var dummy0 = [];
    var dummy1 = [];
    var dummy2 = [];
    var dummy3 = [];
    dummy0.length = numDeps;
    dummy1.length = numDeps;
    dummy2.length = numDeps;
    dummy3.length = numDeps;
    var press = [dummy0, dummy1, dummy2, dummy3];
    //double ln10 = Math.log(10.0); //handy wee quantity       
    //Upper boundary condition: total pressure at top of atmosphere
    var p1 = 1.0E-4;
    // System.out.println("HYDROSTAT: ln10= " + ln10 + " p1 " + p1 + "\r\n");
    //Finite differences in log(Tau) space - deltaX should be uniform, 
    //   but compute it on the fly anyway in case we play with other tau scales
    press[0][0] = p1;
    press[1][0] = Math.log(p1);
    press[2][0] = p1;
    press[3][0] = Math.log(p1);
    // Decalare scratch variables:
    var deltaX, deltaP, help, p2, p3;
    var logPrad, pRad, helpSub, h, k1, k2, k3, k4;
    // Calculate P at the 2nd depth point in using Euler's method:
    // deltaX = tauRos[1][1] - tauRos[1][0];
    // help = (tauRos[0][0] / kappa[0][0]) * grav;
    // deltaP = help * (deltaX);
    // p2 = p1 + deltaP;
    //  // Compute LTE bolometric radiation contribution to total HSE pressure
    // logPrad = radFac + 4.0 * temp[1][1];
    //  pRad = Math.exp(logPrad);
    // // Avoid zero or negative Pgas values in subtraction below:
    //  if (pRad >= 0.99 * p2) {
    //      pRad = 0.99 * p2;
    //  }
//
    //   // Avoid a direct subtraction in case Prad is close to Pgas for deeper 
    //  // layers of hotter stars, and both values are large:
    //  //pGas = p2 - pRad;
    //   helpSub = 1.0E0 - (pRad / p2);
    //   press[0][1] = helpSub * p2;
    //  press[1][1] = Math.log(press[0][1]);
//    press[2][1] = pRad;
    //   press[3][1] = Math.log(pRad);
    //System.out.println("HYDROSTAT: i " + i + " Pgas " + press[0][i] + " Prad " + pRad);
    //Set lower boundary of next step:
    //p1 = p2;

    // RK4 for (var i = 2; i < numDeps; i++) {  //RK4
    for (var i = 1; i < numDeps; i++) {

        // Euler's method:
        // Delta log(tau):
        deltaX = tauRos[1][i] - tauRos[1][i - 1];
        help = (tauRos[0][i] / kappa[0][i]) * grav;
        //// deltaP = help * ( deltaX ); //log10
        deltaP = help * (deltaX);
        p2 = p1 + deltaP;
        //// 4th order Runge-Kutte (mid-point), p. 705, Numerical Recipes in F77, 2nd Ed.
        // h = tauRos[1][i] - tauRos[1][i - 2];
        // k1 = h * (tauRos[0][i - 2] / kappa[0][i - 2]) * grav;
        // k2 = h * (tauRos[0][i - 1] / kappa[0][i - 1]) * grav;
        // k3 = k2;
        // k4 = h * (tauRos[0][i] / kappa[0][i]) * grav;
        //  p3 = p1 + (k1 / 6.0) + (k2 / 3.0) + (k3 / 3.0) + (k4 / 6.0);
        //System.out.println("HYDROSTAT: i " + i + " deltaX " + deltaX + 
        //                   " help " + help + " deltaP " + deltaP + " p1 " + p1 + " p2 " + p2);
        // Compute LTE bolometric radiation contribution to total HSE pressure
        logPrad = radFac + 4.0 * temp[1][i];
        pRad = Math.exp(logPrad);
        // Avoid zero or negative Pgas values in subtraction below:
        if (pRad >= 0.99 * p2) {
            pRad = 0.99 * p2;
        }  //Euler
        //  if (pRad >= 0.99 * p3) {
        //       pRad = 0.99 * p3;
        //   } // 2nd O R-K

        // Avoid a direct subtraction in case Prad is close to Pgas for deeper 
        // layers of hotter stars, and both values are large:
        //pGas = p2 - pRad;
        helpSub = 1.0E0 - (pRad / p2); //Euler
        //  helpSub = 1.0E0 - (pRad / p3); // 2nd O R-K

        press[0][i] = helpSub * p2; //Euler
        //   press[0][i] = helpSub * p3; // 2nd O R-K
        press[1][i] = Math.log(press[0][i]);
        press[2][i] = pRad;
        press[3][i] = Math.log(pRad);
        //System.out.println("HYDROSTAT: i " + i + " Pgas " + press[0][i] + " Prad " + pRad);
        //Set lower boundary of next step:
        //p1 = p2; //Euler
        p1 = p2; // 2nd O R-K
        //   p2 = p3; // 2nd O R-K

    }

    return press;
}
;
/**
 * Solves the equation of state (EOS) for the mass density (rho) given total
 * pressure from HSE solution, for a mixture of ideal gas particles and photons
 *
 * Need to assume a mean molecular weight structure, mu(Tau)
 *
 */
var massDensity = function(numDeps, temp, press, mmw, kappaScale) {

    //press is a 4 x numDeps array:
    // rows 0 & 1 are linear and log *gas* pressure, respectively
    // rows 2 & 3 are linear and log *radiation* pressure
    // double c = 9.9989E+10; // light speed in vaccuum in cm/s
    // double sigma = 5.670373E-5;   //Stefan-Boltzmann constant ergs/s/cm^2/K^4   
    //Row 0 of mmwNe is Mean molecular weight in amu
    var logE = logTen(Math.E); // for debug output
    var k = 1.3806488E-16; // Boltzmann constant in ergs/K
    var amu = 1.66053892E-24; // atomic mass unit in g
    var logK = Math.log(k);
    var logMuAmu;
    var logAmu = Math.log(amu);
    var dummy0 = [];
    var dummy1 = [];
    dummy0.length = numDeps;
    dummy1.length = numDeps;
    var rho = [dummy0, dummy1];
    // Declare scatch variables:
    // double logPrad, pRad, pGas, logPgas;
    for (var i = 0; i < numDeps; i++) {

        logMuAmu = Math.log(mmw[i]) + logAmu;
        // Compute LTE bolometric radiation contribution to total HSE pressure
        //logPrad = radFac + 4.0*temp[1][i] ;
        //pRad = Math.exp(logPrad);
        //pGas = press[0][i] - pRad;
        //logPgas = Math.log(pGas);
        rho[1][i] = press[1][i] - temp[1][i] + (logMuAmu - logK);
        rho[0][i] = Math.exp(rho[1][i]);
        //console.log("i " + i + " press[1] " + logE*press[1][i] + " mmw[i] " + mmw[i] + " rho " + logE * rho[1][i]);
    }

    return rho;
};
var mmwFn = function(numDeps, temp, kappaScale) {

    //Row 0 is linear mean molecular weight, "mu", in amu
    //Row 1 is log_e electron density in cm^-3


    var mmw = [];
    mmw.length = numDeps;
    var logE = logTen(Math.E); // for debug output

    var k = 1.3806488E-16; // Boltzmann constant in ergs/K               
    var logK = Math.log(k);
    var logMu, logMuN, logMuI, logTempN, logTempI;
    // Carrol & Ostlie 2nd Ed., p. 293: mu_N = 1.3, mu_I = 0.62
    logMuN = Math.log(1.3);
    logMuI = Math.log(0.62);
    logTempN = Math.log(4000.0); // Teff in K for fully neutral gas?
    logTempI = Math.log(10000.0); // Teff in K for *Hydrogen* fully ionized?

    //System.out.println("temp   logNe   mu");
    for (var id = 0; id < numDeps; id++) {

        //Give mu the same temperature dependence as 1/Ne between the fully neutral and fully ionized limits?? - Not yet! 
        if (temp[1][id] < logTempN) {
            mmw[id] = Math.exp(logMuN);
        } else if ((temp[1][id] > logTempN) && (temp[1][id] < logTempI)) {
            logMu = logMuN + ((temp[1][id] - logTempN) / (logTempI - logTempN)) * (logMuI - logMuN);
            //Mean molecular weight in amu
            mmw[id] = Math.exp(logMu);
        } else {
            mmw[id] = Math.exp(logMuI);
        }

    }

    return mmw;
};
var NeFn = function(numDeps, temp, NeDfg2, kappaScale) {

    //Row 0 is linear mean molecular weight, "mu", in amu
    //Row 1 is log_e electron density in cm^-3

    var neRow0 = [];
    var neRow1 = [];
    neRow0.length = numDeps;
    neRow1.length = numDeps;
    var Ne = [
        neRow0,
        neRow1
    ];
    var logE = logTen(Math.E); // for debug output

    var k = 1.3806488E-16; // Boltzmann constant in ergs/K               
    var logK = Math.log(k);
    //System.out.println("temp   logNe   mu");
    for (var id = 0; id < numDeps; id++) {

        if (temp[0][id] < 7300.0) {
            Ne[0][id] = NeDfg2[0][id] * kappaScale;
            Ne[1][id] = Math.log(Ne[0][id]);
        } else {
            // Expression for cgs logNe for *hot* *MS* stars from *MKS* logPe expression from D. Turner (private communication):
            // *** We need to do better than this...
            Ne[1][id] = -4.5 - logK + 0.5 * temp[1][id] - 6.0 + Math.log(kappaScale); // last term converts m^-3 to cm^-3  
            Ne[0][id] = Math.exp(Ne[1][id]);
            //System.out.format("%12.8f   %12.8f   %12.8f%n", temp[0][id], logE * mmwNe[1][id], mmwNe[0][id]);

        }
    }

    return Ne;
};
/** 
 * Returns vector of numDep linear geometric DEPTHS below top of atmosphere - in
 * cm (cgs) for consistency with log(g) units
 *
 * *May not be useful - scale depends on log(g)
 */
var depthScale = function(numDeps, tauRos, kappa, rho) {

    var logE = logTen(Math.E); // for debug output
//double ln10 = Math.log(10.0); //handy wee quantity 
//log_10 Rosseland optical depth scale  
    var depths = [];
    depths.length = numDeps;
    // Upper bounday condition: 
    // Zero point at top of atmosphere - this can be shifted later?
    // log(z) cannot really correspond to zero 
    //double logZ1 = -10.0;  // log(cm)
    //depths[0] = Math.pow(10.0, logZ1);  //cm
    var iStart = 10;
    var z1 = 0; //cm

    for (var i = 0; i <= iStart; i++) {
        depths[i] = z1;
    }
    //var minZ = 1.0E5; // = 1km - Minimum increase in depth from one point to the next

    // declare scratch variables
    //double deltaX, deltaZ, logZ2;
    var deltaX, deltaZ, z2, z3, help, logHelp, helpNext;
    //        h, k1, k2, k3, k4, logH, logK1, logK2, logK3, logK4;
    //Euler's method for depth at 2nd point in
    // Need to avoid using rho at upper boundary, so rho value must be taken at y_n+2 on all RHSs

    //z1 =z2;
    //Trapezoid rule:
    //First integrand:
    //deltaX = tauRos[1][iStart+1] - tauRos[1][iStart];
    logHelp = tauRos[1][iStart] - kappa[1][iStart] - rho[1][iStart];
    helpNext = Math.exp(logHelp);
    help = helpNext;
    for (var i = iStart + 1; i < numDeps; i++) {

//Trapezoid method:
        deltaX = tauRos[1][i] - tauRos[1][i - 1];
        logHelp = tauRos[1][i] - kappa[1][i] - rho[1][i];
        helpNext = Math.exp(logHelp);
        deltaZ = deltaX * (0.5 * (help + helpNext));
        //console.log("i " + i + " tauRos[1] " + logE*tauRos[1][i] + " kappa[1] " + logE*kappa[1][i] + " rho[1] " + logE*rho[1][i] + " deltaX " + deltaX + " deltaZ " + deltaZ);
        z2 = z1 + deltaZ;
        depths[i] = z2;
        z1 = z2;
        help = helpNext;
    }

    return depths;
};
var mgTCorr = function(numDeps, teff, tauRos, temp, rho, kappa) {


    // updated temperature structure

    var ntRow0 = [];
    var ntRow1 = [];
    ntRow0.length = numDeps;
    ntRow1.length = numDeps;
    var newTemp = [
        ntRow0,
        ntRow1
    ];
    //Teff boundary between early and late-type stars:
    var isCool = 6500.0;
    //Set up multi-gray opacity:
    // lambda break-points and gray levels:
    // No. multi-gray bins = num lambda breakpoints +1
    //double[] grayLams = {30.0, 1.0e6};  //nm //test
    //double[] grayLevel = {1.0};  //test
    // ***  Late type stars, Teff < 9500 K (???):
    //

    var minLambda = 30.0; //nm
    var maxLambda = 1.0e6; //nm
    var maxNumBins = 11;
    var grayLams = [];
    grayLams.length = maxNumBins + 1;
    var grayLevel = [];
    grayLevel.length = maxNumBins;
    var epsilon = [];
    epsilon.length = maxNumBins;
    //initialize everything first:
    for (var iB = 0; iB < maxNumBins; iB++) {
        grayLams[iB] = maxLambda;
        grayLevel[iB] = 1.0;
        epsilon[iB] = 0.99;
    }
    grayLams[maxNumBins] = maxLambda; //Set final wavelength

    var grayLevelsEpsilons = grayLevEps(maxNumBins, minLambda, maxLambda, teff, isCool);
    //Find actual number of multi-gray bins:
    var numBins = 0; //initialization
    for (var i = 0; i < maxNumBins; i++) {
        if (grayLevelsEpsilons[0][i] < maxLambda) {
            numBins++;
        }
    }

    /*
     if (teff < isCool) {
     // physically based wavelength break-points and gray levels for Sun from Rutten Fig. 8.6
     // H I Balmer and Lyman jumps for lambda <=3640 A, H^- b-f opacity hump in visible & hole at 1.6 microns, increasing f-f beyond that
     var lamSet = [minLambda, 91.1, 158.5, 364.0, 794.3, 1600.0, 3.0e3, 1.0e4, 3.3e4, 1.0e5, 3.3e5, maxLambda];
     var levelSet = [1000.0, 100.0, 5.0, 1.0, 0.3, 1.0, 3.0, 10.0, 30.0, 100.0, 1000.0];
     //photon *thermal* destruction and creation probability (as opposed to scattering)
     //WARNING:  THese cannot be set exactly = 1.0 or a Math.log() will blow up!!
     var epsilonSet = [0.50, 0.50, 0.50, 0.50, 0.50, 0.9, 0.99, 0.99, 0.99, 0.99, 0.99];
     var numBins = levelSet.length;
     for (var iB = 0; iB < numBins; iB++) {
     grayLams[iB] = lamSet[iB] * 1.0e-7;
     grayLevel[iB] = levelSet[iB];
     epsilon[iB] = epsilonSet[iB];
     }
     grayLams[numBins] = lamSet[numBins] * 1.0e-7; //Get final wavelength
     } else {
     // *** Early type stars, Teff > 9500 K (???)
     // It's all about H I b-f (??) What about Thomson scattering (gray)?
     // Lyman, Balmer, Paschen, Brackett jumps
     //Do we need He I features?
     var lamSet = [minLambda, 91.1, 364.0, 820.4, 1458.0, maxLambda];
     var levelSet = [100.0, 10.0, 2.0, 1.0, 1.0]; //???
     var epsilonSet = [0.5, 0.6, 0.7, 0.8, 0.5];
     var numBins = levelSet.length;
     for (var iB = 0; iB < numBins; iB++) {
     grayLams[iB] = lamSet[iB] * 1.0e-7;
     grayLevel[iB] = levelSet[iB];
     epsilon[iB] = epsilonSet[iB];
     }
     grayLams[numBins] = lamSet[numBins] * 1.0e-7; //Get final wavelength
     }
     
     
     //Find out how many bins we really have:
     var numBins = 0; //initialize
     for (var iB = 0; iB < maxNumBins; iB++) {
     if (grayLams[iB] < maxLambda) {
     numBins++;
     }
     }
     */
    for (var iB = 0; iB < numBins; iB++) {
        grayLams[iB] = grayLevelsEpsilons[0][iB];
        grayLevel[iB] = grayLevelsEpsilons[1][iB];
        epsilon[iB] = grayLevelsEpsilons[2][iB];
    }

    grayLams[numBins] = grayLevelsEpsilons[0][numBins]; //Get final wavelength

    //console.log("numBins: " + numBins);
    //Set overall gray-level - how emissive and absorptive the gas is overall
    // a necessary "fudge" because our kappa values are arbitrary rather than "in situ"
    var graySet = 1.0;
    //double tcDamp = 0.5; // damp the temperature corrections, Delta T, by this *multiplicative* factor
    var tcDamp = 1.0; // no damping - Lambda iteration is slow rather than oscillatory

    var logE = logTen(Math.E); // for debug output

    //double[][] planckBol = MulGrayTCorr.planckBin(numDeps, temp, lamStart, lamStop);
    var planckBol = []; //just for reference - not really needed - ??
    var jayBol = []; //just for reference - not really needed - ??
    var dBdTBol = []; //just for reference - not really needed - ??
    var cool = []; // cooling term in Stromgren equation
    var heat = []; // heating term in Stromgren equation
    var corrDenom = []; //denominator in 1st order temp correction
    planckBol.length = numDeps;
    jayBol.length = numDeps;
    dBdTBol.length = numDeps;
    cool.length = numDeps;
    heat.length = numDeps;
    corrDenom.length = numDeps;
    //double[] accumB = new double[numDeps]; //accumulator

    //CAUTION: planckBin[2][]: Row 0 is bin-integrated B_lambda; row 1 is bin integrated dB/dT_lambda
    // updated temperature structure


    var planckBin = [];
    planckBin.length = 2;
    planckBin[0] = [];
    planckBin[1] = [];
    planckBin[0].length = numDeps;
    planckBin[1].length = numDeps;
    var jayBin = [];
    jayBin.length = numDeps;
    var dBdTBin = [];
    dBdTBin.length = numDeps;
    var logCool, logHeat, logCorrDenom, logCoolTherm, logCoolScat;
    // initialize accumulators & set overell gray kappa level:
    for (var iTau = 0; iTau < numDeps; iTau++) {

        planckBol[iTau] = 0.0; //just for reference - not really needed - ??
        jayBol[iTau] = 0.0; //just for reference - not really needed - ??
        dBdTBol[iTau] = 0.0; //just for reference - not really needed - ??
        cool[iTau] = 0.0;
        heat[iTau] = 0.0;
        corrDenom[iTau] = 0.0;
        kappa[1][iTau] = kappa[1][iTau] + Math.log(graySet);
        kappa[0][iTau] = Math.exp(kappa[1][iTau]);
    }

    for (var iB = 0; iB < numBins; iB++) {
        //System.out.println("iB: " + iB + " grayLams[iB] " + grayLams[iB]);
        planckBin = planckBinner(numDeps, temp, grayLams[iB], grayLams[iB + 1]);
        // We are lambda-operating on a wavelength integrated B_lambda for each multi-gray bin
        jayBin = jayBinner(numDeps, tauRos, temp, planckBin, grayLevel[iB]);
        //System.out.println("tauRos[1][iTau]   planckBin[0]   planckBin[1]   jayBin");
        for (var iTau = 0; iTau < numDeps; iTau++) {
            //System.out.format("%12.8f   %12.8f   %12.8f   %12.8f%n",
            //        logE * tauRos[1][iTau], logE * Math.log(planckBin[0][iTau]), logE * Math.log(planckBin[1][iTau]), logE * Math.log(jayBin[iTau]));
            //CAUTION: planckBin[2][]: Row 0 is bin-integrated B_lambda; row 1 is bin integrated dB/dT_lambda
            //Net LTE volume cooling rate deltaE = Integ_lam=0^infnty(4*pi*kappa*rho*B_lam)dlam - Integ_lam=0^infnty(4*pi*kappa*rho*J_lam)dlam
            // where Jlam = LambdaO[B_lam] - Rutten Eq. 7.32, 7.33 
            // CAUTION: the 4pi and rho factors cancel out when diving B-J term by dB/dT term 
            planckBol[iTau] = planckBol[iTau] + planckBin[0][iTau]; //just for reference - not really needed - ??
            //logCool = Math.log(grayLevel[iB]) + kappa[1][iTau] + Math.log(planckBin[0][iTau]);  //no scatering
            //cool[iTau] = cool[iTau] + Math.exp(logCool);   //no scattering
            logCoolTherm = Math.log(grayLevel[iB]) + Math.log(epsilon[iB]) + kappa[1][iTau] + Math.log(planckBin[0][iTau]);
            logCoolScat = Math.log(grayLevel[iB]) + Math.log((1.0 - epsilon[iB])) + kappa[1][iTau] + Math.log(jayBin[iTau]);
            cool[iTau] = cool[iTau] + Math.exp(logCoolTherm) + Math.exp(logCoolScat);
            jayBol[iTau] = jayBol[iTau] + jayBin[iTau]; //just for reference - not really needed - ??
            logHeat = Math.log(grayLevel[iB]) + kappa[1][iTau] + Math.log(jayBin[iTau]);
            heat[iTau] = heat[iTau] + Math.exp(logHeat);
            dBdTBol[iTau] = dBdTBol[iTau] + planckBin[1][iTau]; //just for reference - not really needed - ??
            logCorrDenom = Math.log(grayLevel[iB]) + kappa[1][iTau] + Math.log(planckBin[1][iTau]);
            corrDenom[iTau] = corrDenom[iTau] + Math.exp(logCorrDenom);
            //if (iTau === 10) {
            //    console.log("iB " + iB + " " + logE*Math.log(planckBin[0][iTau]) + " " + logE*Math.log(cool[iTau]) + " " + logE*Math.log(heat[iTau]) + " " + logE*Math.log(corrDenom[iTau]));
            //}
        } //iTau
    }  //iB

    //console.log("i   tauRos[1][iTau]   planckBol[0]   planckBol[1]   jayBol      cool      heat      corrDenom");
    for (var iTau = 0; iTau < numDeps; iTau++) {
        //console.log("%02d   %12.8f   %12.8f   %12.8f   %12.8f   %12.8f   %12.8f   %12.8f%n", iTau,
        //        logE * tauRos[1][iTau], logE * Math.log(planckBol[iTau]), logE * Math.log(dBdTBol[iTau]), logE * Math.log(jayBol[iTau]),
        //        logE * Math.log(cool[iTau]), logE * Math.log(heat[iTau]), logE * Math.log(corrDenom[iTau]));
    }

    var logRatio, ratio, deltaTemp, logDeltaTemp;
    var sign = 1.0; //initialize for positive JminusB

    //System.out.println("tauRos[1][iTau]   deltaTemp[iTau]");
    for (var iTau = 0; iTau < numDeps; iTau++) {
        // Compute a 1st order T correction:  Compute J-B so that DeltaT < 0 if J < B:
// avoid direct subtraction of two large almost equal numbers, J & B:

        /* 
         //Gray method:
         
         double JminusB
         logRatio = Math.log(planckBol[iTau]) - Math.log(jayBol[iTau]);
         ratio = Math.exp(logRatio);
         JminusB = jayBol[iTau] * (1.0 - ratio);
         if (JminusB < 0.0) {
         sign = -1.0;
         }
         
         // DeltaB/DeltaT ~ dB/dT & dB/dT = (4/pi)sigma*T^3
         logDeltaTemp = Math.log(Math.abs(JminusB)) + Math.log(Math.PI) - Math.log(4.0) - Useful.logSigma() - 3.0 * temp[1][iTau];
         deltaTemp[iTau] = sign * Math.exp(logDeltaTemp) * tcDamp;
         //System.out.format("%12.8f   %12.8f%n", tauRos[1][iTau], deltaTemp[iTau]);
         
         sign = 1.0; //reset sign
         */
        //Multi-Gray method:
        var deltaE;
        //double logHeatNorm, heatNorm, logCoolNorm, deltaENorm;

        ////Normalize numbers by dividing heat and cool terms each by common denominator derivative term first:
        //logHeatNorm = Math.log(heat[iTau]) - Math.log(corrDenom[iTau]);
        //heatNorm = Math.exp(logHeatNorm);
        //logCoolNorm = Math.log(cool[iTau]) - Math.log(corrDenom[iTau]);
        logRatio = Math.log(cool[iTau]) - Math.log(heat[iTau]);
        //logRatio = logCoolNorm - logHeatNorm;

        ratio = Math.exp(logRatio);
        deltaE = heat[iTau] * (1.0 - ratio);
        //deltaENorm = heatNorm * (1.0 - ratio);
        if (deltaE < 0.0) {
            sign = -1.0;
        }
        //CHEAT: Try a Tau-dependent deltaE damping here - things are flaky at tdepth where t(Tau) steepens
        deltaE = deltaE * Math.exp(1.0 * (tauRos[0][0] - tauRos[0][iTau]));
        // DeltaE/DeltaT ~ dB/dT_Bol
        logDeltaTemp = Math.log(Math.abs(deltaE)) - Math.log(corrDenom[iTau]);
        deltaTemp = sign * Math.exp(logDeltaTemp) * tcDamp;
        //deltaTemp = sign * deltaENorm * tcDamp;

        newTemp[0][iTau] = temp[0][iTau] + deltaTemp;
        newTemp[1][iTau] = Math.log(newTemp[0][iTau]);
    } //iTau loop

    return newTemp;
};
// method jayBolom computes bolometric angle-averaged mean intensity, J
// This is a Lambda operation, ie. the Schwartzschild equation
var jayBinner = function(numDeps, tauRos, temp, planckBin, grayLevel) {

    // For bolometric J on a Gray Tau scale in LTE: 
    // J(Tau) = 1/2 * Sigma_Tau=0^Infty { E_1(|t-Tau|)*Planck_Bol(Tau) }
    var logE = logTen(Math.E); // for debug output

    var E1; //E_1(x)

    //Set up local optical depth scale:

    var tauBin = [];
    tauBin.length = 2;
    tauBin[0] = [];
    tauBin[1] = [];
    tauBin[0].length = numDeps;
    tauBin[1].length = numDeps;
    var deltaTauRos;
    tauBin[0][0] = tauRos[0][0] * grayLevel; // Is this a good idea??
    tauBin[1][0] = Math.log(tauBin[0][0]);
    for (var iTau = 1; iTau < numDeps; iTau++) {
        deltaTauRos = tauRos[0][iTau] - tauRos[0][iTau - 1];
        //grayLevel *is*, by definition, the ratio kappa_Bin/kappaRos that we need here!
        tauBin[0][iTau] = tauBin[0][iTau - 1] + grayLevel * deltaTauRos;
        tauBin[1][iTau] = Math.log(tauBin[0][iTau]);
    }

    var logInteg, integ, integ1, integ2, logInteg1, logInteg2, meanInteg, logMeanInteg, term, logTerm;
    var deltaTau, logDeltaTau; //accumulator
    var accum = 0.0; //accumulator

    var jayBin = [];
    jayBin.length = numDeps;
    // if E_1(t-Tau) evaluated at Tau=bottom of atmosphere, then just set Jay=B at that Tau - we're deep enough to be thermalized
    // and we don't want to let lambda operation implicitly include depths below bottom of model where B=0 implicitly 
    var tiny = 1.0e-14; //tuned to around maxTauDIff at Tau_Ros ~ 3
    var maxTauDiff;
    //stipulate the {|t-Tau|} grid at which E_1(x)B will be evaluated - necessary to sample the 
    // sharply peaked integrand properly
    // ** CAUTION: minLog10TmTau and maxLog10TmTau are tau offsets from the centre of J integration, 
    //  NOT the optical depth scale of the atmosphere!
    //stipulate the {|t-Tau|} grid at which E_1(x)B will be evaluated - necessary to sample the 
    // sharply peaked integrand properly
    var fineFac = 3.0; // integrate E1 on a grid fineFac x finer in logTau space
    var E1Range = 36.0; // number of master tauBin intervals within which to integrate J 
    var numInteg = E1Range * fineFac; //
    var deltaLogTauE1 = (tauBin[1][numDeps - 1] - tauBin[1][0]) / numDeps;
    deltaLogTauE1 = deltaLogTauE1 / fineFac;
    var thisTau1, logThisTau1, thisTau2, logThisTau2, logE1, deltaTauE1, logThisPlanck, iFloat;
    //Prepare 1D vectors for Interpol.interpol:
    var logTauBin = [];
    logTauBin.length = numDeps;
    var logPlanck = [];
    logPlanck.length = numDeps;
    //System.out.println("logTauBin  logB");
    for (var k = 0; k < numDeps; k++) {
        logTauBin[k] = tauBin[1][k];
        logPlanck[k] = Math.log(planckBin[0][k]);
        //System.out.format("%12.8f   %12.8f%n", logE*logTauBin[k], logE*logPlanck[k]);
    }

    //Outer loop over Taus where Jay(Tau) being computed:
    // Start from top and work down to around tau=1 - below that assume we're thermalized with J=B
    //System.out.println("For logTauRos = " + logE*tauRos[1][40] + ": thisTau  E1xB  E1  B");
    //System.out.println("tauRos[1][iTau]   Math.log(planckBin[iTau])   jayBin[1][iTau]");
    for (var iTau = 0; iTau < numDeps; iTau++) {
        //System.out.println("jayBinner: iTau: " + iTau + " tauRos[0] " + tauRos[0][iTau] + " tauRos[1] " + logE * tauRos[1][iTau]);
        jayBin[iTau] = planckBin[0][iTau]; //default initialization J_bin = B_bin

        if (tauRos[0][iTau] <= 66.67) {
            //System.out.println("tauRos[0] < limit condition passed");
            // initial test - don't let E_1(x) factor in integrand run off bottom of atmosphere
            // - we have no emissivity down there and J will drop below B again, like at surface!
            maxTauDiff = Math.abs(tauBin[0][numDeps - 1] - tauBin[0][iTau]);
            //System.out.println("tauBin[0][numDeps - 1]: " + tauBin[0][numDeps - 1] + " tauBin[0][iTau] " + tauBin[0][iTau] + " maxTauDiff " + maxTauDiff);
            //System.out.println("maxTauDiff= " + maxTauDiff + " expOne(maxTauDiff)= " + expOne(maxTauDiff));
            if (expOne(maxTauDiff) < tiny) {

                //System.out.println("maxTauDiff < tiny condition passed, expOne(maxTauDiff): " + expOne(maxTauDiff));
// We're above thermalization depth: J may not = B:
                //Inner loop over depths contributing to each Jay(iTau):
                // work outward from t=Tau (ie. i=iTau) piece-wise  
                accum = 0.0;
                // conribution from depths above Tau:
                // start at i=1 instead of i=0 - cuts out troublesome central cusp of E_1(x) - but now we underestimate J!
                //initial integrand:
                logThisTau1 = tauBin[1][iTau] - deltaLogTauE1;
                thisTau1 = Math.exp(logThisTau1);
                deltaTauE1 = tauBin[0][iTau] - thisTau1;
                E1 = expOne(deltaTauE1);
                logE1 = Math.log(E1);
                logThisPlanck = interpol(logTauBin, logPlanck, logThisTau1);
                logInteg1 = logE1 + logThisPlanck;
                integ1 = Math.exp(logInteg1);
                for (var i = 2; i < numInteg - 1; i++) {

                    iFloat = 1.0 * i;
                    // Evaluate E_1(x) and log(E_1(x)) one and for all here

                    //System.out.format("%02d %12.8f %12.8f%n", j, tmTau[j], E1);
                    // LTE bolometric source function is Bolometric Planck function
                    // Extended trapezoidal rule for non-uniform abscissae - this is an exponential integrand!             
                    // We cannot evaluate E_1(x) at x=0 - singular:

                    logThisTau2 = tauBin[1][iTau] - iFloat + 1.0 * deltaLogTauE1;
                    thisTau2 = Math.exp(logThisTau2);
                    //if (i === numInteg - 2) {
                    //    System.out.println("i " + i + " logThisTau1 " + logE * logThisTau1 + " logThisTau2 " + logE * logThisTau2);
                    //}
                    // Make sure we're still in the atmosphere!
                    if (logThisTau2 > tauBin[1][0]) {
                        //if (i === numInteg - 2) {
                        //    System.out.println("thisTau2 > tauBin[0][0] condition passed");
                        //}
                        //if (iTau === 37) {
                        //    System.out.println("i " + i + " logThisTau1 " + logE * logThisTau1 + " logThisTau2 " + logE * logThisTau2);
                        //}

                        deltaTauE1 = tauBin[0][iTau] - thisTau2;
                        E1 = expOne(deltaTauE1);
                        logE1 = Math.log(E1);
                        // interpolate log(B(log(Tau)) to the integration abscissa
                        logThisPlanck = interpol(logTauBin, logPlanck, logThisTau2);
                        logInteg2 = logE1 + logThisPlanck;
                        integ2 = Math.exp(logInteg2);
                        logDeltaTau = Math.log(thisTau1 - thisTau2); // logDeltaTau *NOT* the same as deltaLogTau!!

                        meanInteg = 0.5 * (integ1 + integ2); //Trapezoid rule
                        logMeanInteg = Math.log(meanInteg);
                        //if (iTau === 40) {
                        //    System.out.format("%15.8f    %15.8f    %15.8f   %15.8f%n", logE*Math.log(thisTau1), logE*logMeanInteg, logE*logE1, logE*logThisPlanck);
                        //}

                        logTerm = logMeanInteg + logDeltaTau;
                        term = Math.exp(logTerm);
                        accum = accum + term;
                        integ1 = integ2;
                        thisTau1 = thisTau2;
                        //if (iTau === 41){
                        //    System.out.println("term " + term + " accum " + accum);
                        //}
                    } // thisTau > 0
                } // i ("t") loop, above iTau 

                jayBin[iTau] = 0.5 * accum; //store what we have.
                //test jayBin[iTau] = 0.5 * planckBin[0][iTau]; // fake upper half with isotropic result
                //test jayBin[iTau] = jayBin[iTau] + 0.5 * planckBin[0][iTau]; // test upper atmosphere part of J integration by fixing lower part with isotropic result

                // conribution from depths below Tau:
                // include iTau itself so we don't miss the area under the central peak of E_1(x) - the expOne function
                // will protect itself from the x=0 singularity using variable 'tiny'
                accum = 0.0;
                //initial integrand:
                // start at i=1 instead of i=0 - cuts out troublesome central cusp of E_1(x) - but now we underestimate J!
                logThisTau1 = tauBin[1][iTau] + deltaLogTauE1;
                thisTau1 = Math.exp(logThisTau1);
                deltaTauE1 = thisTau1 - tauBin[0][iTau];
                E1 = expOne(deltaTauE1);
                logE1 = Math.log(E1);
                logThisPlanck = interpol(logTauBin, logPlanck, logThisTau1);
                logInteg1 = logE1 + logThisPlanck;
                integ1 = Math.exp(logInteg1);
                for (var i = 2; i < numInteg - 1; i++) {

                    iFloat = 1.0 * i;
                    logThisTau2 = tauBin[1][iTau] + iFloat * deltaLogTauE1;
                    thisTau2 = Math.exp(logThisTau2);
                    // We cannot evaluate E_1(x) at x=0 - singular:
                    // Extended trapezoidal rule for non-uniform abscissae - the is an exponential integrand! 

                    // make sure we're still in the atmosphere!
                    if (logThisTau2 < tauBin[1][numDeps - 1]) {

                        deltaTauE1 = thisTau2 - tauBin[0][iTau];
                        E1 = expOne(deltaTauE1);
                        logE1 = Math.log(E1);
                        logThisPlanck = interpol(logTauBin, logPlanck, logThisTau2);
                        logInteg2 = logE1 + logThisPlanck;
                        integ2 = Math.exp(logInteg2);
                        logDeltaTau = Math.log(thisTau2 - thisTau1); // logDeltaTau *NOT* the same as deltaLogTau!!

                        meanInteg = 0.5 * (integ1 + integ2); //Trapezoid rule
                        logMeanInteg = Math.log(meanInteg);
                        //if (iTau === 40) {
                        //    System.out.format("%15.8f    %15.8f    %15.8f    %15.8f%n", logE*Math.log(thisTau1), logE*logMeanInteg, logE*logE1, logE*logThisPlanck);
                        //}

                        // LTE bolometric source function is Bolometric Plnack function
                        logTerm = logMeanInteg + logDeltaTau;
                        term = Math.exp(logTerm);
                        accum = accum + term;
                        integ1 = integ2;
                        thisTau1 = thisTau2;
                    }// if thisTau < tauBin[0][numDeps-1]
                } // i ("t") loop, below iTau

                jayBin[iTau] = jayBin[iTau] + 0.5 * accum;
            } //if branch for E_1(x) safely dwindling away before reaching bottom of atmosphere
        } // if branch for above thermalization depth of Tau=10? 

        //System.out.format("%12.8f   %12.8f  %12.8f%n",
        //       logE * tauRos[1][iTau], Math.log10(planckBin[iTau]), Math.log10(jayBin[iTau]));
    } //iTau loop

    return jayBin;
};
// Compute linear wave-bin-specific lambda-integrated Planck fn AND it's T derivative at all depths:
// Row 0: B_bin(tau);   Row 1: dB/dT_bin(tau);
var planckBinner = function(numDeps, temp, lamStart, lamStop) {


    var planckBin = [];
    planckBin.length = 2;
    planckBin[0] = [];
    planckBin[1] = [];
    planckBin[0].length = numDeps;
    planckBin[1].length = numDeps;
    var logE = logTen(Math.E); // for debug output

    //MultiGray-ready:
    // Parameters of overall lambda grid (nm):
    // Planck.planck() will convert nm to cm
    //double log10LamStart = 1.5;  //must be < first Gray lambda break point
    //double log10LamStop = 5.0;   //must be > last Gray lambda break point 
    var log10LamStart = logTen(lamStart);
    var log10LamStop = logTen(lamStop);
    var deltaLog10Lam = 0.1;
    var numLamAll;
    numLamAll = Math.floor(((log10LamStop - log10LamStart) / deltaLog10Lam));
    var lambda = [];
    lambda.length = numLamAll;
    //Generate lambda grid separately to avoid duplicate lambda generation
    var iFloat, thisLogLam;
    //System.out.println("lambdas");
    for (var i = 0; i < numLamAll; i++) {

        iFloat = 1.0 * i;
        thisLogLam = log10LamStart + iFloat * deltaLog10Lam;
        lambda[i] = Math.pow(10.0, thisLogLam);
        //System.out.format("%02d   %12.8f%n", i, lambda[i]);

    }

    var thisLam1, thisLam2, deltaLam, planck1, planck2, logPlanck1, logPlanck2;
    var term, integ, accum;
    var dBdT1, dBdT2, logdBdT1, logdBdT2, accum2;
    //trapezoid rule integration
    //System.out.println("Trapezoid: ");
    for (var iTau = 0; iTau < numDeps; iTau++) {
        //reset accumulators for new depth
        accum = 0.0;
        accum2 = 0.0;
        //initial integrands:
        logPlanck1 = planck(temp[0][iTau], lambda[0]);
        planck1 = Math.exp(logPlanck1);
        logdBdT1 = dBdT(temp[0][iTau], lambda[0]);
        dBdT1 = Math.exp(logdBdT1);
        for (var i = 1; i < numLamAll - 1; i++) {

            deltaLam = lambda[i + 1] - lambda[i];
            //deltaLam = deltaLam * 1.0e-7; //nm to cm

            //Planck.planck returns log(B_lambda)

            logPlanck2 = planck(temp[0][iTau], lambda[i]);
            planck2 = Math.exp(logPlanck2);
            //if (i === 20) {
            //    System.out.println("lambda " + thisLam1 + " temp[0][iTau] " + temp[0][iTau] + " logPlanck1 " + logE*logPlanck1);
            //}
            //trapezoid rule integration
            integ = 0.5 * (planck1 + planck2) * deltaLam;
            accum = accum + integ;
            planck1 = planck2;
            //Now do the same for dB/dT:
            //Planck.dBdT returns log(dB/dT_lambda)

            logdBdT2 = dBdT(temp[0][iTau], lambda[i]);
            dBdT2 = Math.exp(logdBdT2);
            //trapezoid rule integration
            integ = 0.5 * (dBdT1 + dBdT2) * deltaLam;
            accum2 = accum2 + integ;
            dBdT1 = dBdT2;
        } // lambda i loop
        planckBin[0][iTau] = accum;
        planckBin[1][iTau] = accum2;
        //System.out.format("%02d   %12.8f%n", iTau, planckBin[iTau]);

    } //iTau loop

    //// Gray only:
    ////if (lamStart === 1000.0) {  //Could be for any gray wavelength
    //double[][] planckBol = new double[2][numDeps];
    //double[][] dBdTBol = new double[2][numDeps];
    //System.out.println("Stefan-Boltzmann:  tauRos[1]  B_Bol   dBdT_Bol");
    //for (int i = 0; i < numDeps; i++) {
    //    planckBol[1][i] = Useful.logSigma() + 4.0 * temp[1][i] - Math.log(Math.PI);
    //    planckBol[0][i] = Math.exp(planckBol[1][i]);
    //    dBdTBol[1][i] = Math.log(4.0) + Useful.logSigma() + 3.0 * temp[1][i] - Math.log(Math.PI);
    //    dBdTBol[0][i] = Math.exp(dBdTBol[1][i]);
    //    System.out.format("%02d   %12.8f   %12.8f%n", i, logE * planckBol[1][i], logE * dBdTBol[1][i]);
    //}
    //}
    return planckBin;
};
// Approximate first exponential integral function E_1(x) = -Ei(-x)
var expOne = function(x) {

    // From http://en.wikipedia.org/wiki/Exponential_integral 
    // Series expansion for first exponential integral function, E_1(x) = -Ei(-x)
    // Ee_one(x) = -gamma - ln(abs(x)) - Sigma_k=1^infnty{(-x)^k)/(k*k!)}
    // where: gamma =  Euler–Mascheroni constant = 0.577215665...
    var E1;
    x = Math.abs(x); // x must be positive
    // E1(x) undefined at x=0 - singular:
    //double tiny = 1.25;  //tuned to give J ~ 0.5B @ tau=0
    var tiny = 1.0e-6;
    if (x < tiny) {
        x = tiny;
    }

    // Caution: even at 11th order acuracy (k=11), approximation starts to diverge for x . 3.0:
    if (x > 3.0) {

        E1 = Math.exp(-1.0 * x) / x; // large x approx

    } else {
        var gamma = 0.577215665; //Euler–Mascheroni constant
        var kTerm = 0.0;
        var order = 11; //order of approximation
        var kFloat;
        var accum = 0.0; //accumulator
        var kFac = 1.0; // initialize k! (k factorial)

        for (var k = 1; k <= order; k++) {
            kFloat = 1.0 * k;
            kFac = kFac * kFloat;
            accum = accum + Math.pow((-1.0 * x), kFloat) / (k * kFac);
            //System.out.println("k: " + k + " kFac: " + kFac);
            //System.out.println("k: " + k + " Math.pow(x, kFloat): " + Math.pow(x, kFloat));
        }
        kTerm = accum;
        E1 = -1.0 * gamma - Math.log(Math.abs(x)) - kTerm;
    }

    //System.out.println("x: " + x + " exp1(x): " + E1);
    return E1;
};
var grayLevEps = function(maxNumBins, minLambda, maxLambda, teff, isCool) {

    //double minLambda = 30.0;  //nm
    //double maxLambda = 1.0e6;  //nm
    //int maxNumBins = 11;
    //double[][] grayLevelsEpsilons = new double[3][maxNumBins + 1];
    var grayLevelsEpsilons = [];
    grayLevelsEpsilons.length = 3;
    grayLevelsEpsilons[0] = [];
    grayLevelsEpsilons[1] = [];
    grayLevelsEpsilons[2] = [];
    grayLevelsEpsilons[0].length = maxNumBins + 1;
    grayLevelsEpsilons[1].length = maxNumBins + 1;
    grayLevelsEpsilons[2].length = maxNumBins + 1;
    // The returned structure:
    //Row 0 is wavelength breakpoints
    //Row 1 is relative opacity gray levels
    //Row 2 is absolute thermal photon creation fractions, epsilon

    //initialize everything first:
    for (var iB = 0; iB < maxNumBins; iB++) {
        grayLevelsEpsilons[0][iB] = maxLambda;
        grayLevelsEpsilons[1][iB] = 1.0;
        grayLevelsEpsilons[2][iB] = 0.99;
    }
    grayLevelsEpsilons[0][maxNumBins] = maxLambda; //Set final wavelength

    if (teff < isCool) {
        // physically based wavelength break-points and gray levels for Sun from Rutten Fig. 8.6
        // H I Balmer, Lyman & Paschen jumps for lambda <=3640 A, H^- b-f opacity hump in visible & hole at 1.6 microns, increasing f-f beyond that
        var lamSet = [minLambda, 91.1, 158.5, 364.0, 820.4, 1600.0, 3.0e3, 1.0e4, 3.3e4, 1.0e5, 3.3e5, maxLambda]; //nm
        //var levelSet = [1000.0, 100.0, 5.0, 0.5, 0.3, 1.0, 3.0, 10.0, 30.0, 100.0, 1000.0];
        var levelSet = [1000.0, 100.0, 5.0, 1.0, 0.5, 0.1, 3.0, 10.0, 30.0, 100.0, 1000.0];
        //photon *thermal* destruction and creation probability (as opposed to scattering)
        //WARNING:  THese cannot be set exactly = 1.0 or a Math.log() will blow up!!
        //var epsilonSet = [0.50, 0.50, 0.50, 0.50, 0.50, 0.9, 0.99, 0.99, 0.99, 0.99, 0.99];
        var epsilonSet = [0.50, 0.50, 0.50, 0.99, 0.99, 0.99, 0.99, 0.99, 0.99, 0.99, 0.99];
        var numBins = levelSet.length;
        for (var iB = 0; iB < numBins; iB++) {
            grayLevelsEpsilons[0][iB] = lamSet[iB] * 1.0e-7;
            grayLevelsEpsilons[1][iB] = levelSet[iB];
            grayLevelsEpsilons[2][iB] = epsilonSet[iB];
        }
        grayLevelsEpsilons[0][numBins] = lamSet[numBins] * 1.0e-7; //Get final wavelength
    } else {
        // *** Early type stars, Teff > 9500 K (???)
        // It's all about H I b-f (??) What about Thomson scattering (gray)?
        // Lyman, Balmer, Paschen, Brackett jumps
        //What about He I features?
        var lamSet = [minLambda, 91.1, 364.0, 820.4, 1458.0, maxLambda]; //nm
        var levelSet = [100.0, 10.0, 2.0, 1.0, 1.0]; //???
        var epsilonSet = [0.9, 0.9, 0.9, 0.9, 0.9];
        var numBins = levelSet.length;
        for (var iB = 0; iB < numBins; iB++) {
            grayLevelsEpsilons[0][iB] = lamSet[iB] * 1.0e-7;
            ; //cm
            grayLevelsEpsilons[1][iB] = levelSet[iB];
            grayLevelsEpsilons[2][iB] = epsilonSet[iB];
        }
        grayLevelsEpsilons[0][numBins] = lamSet[numBins] * 1.0e-7; //Get final wavelength
    }

    return grayLevelsEpsilons;
};
var convec = function(numDeps, tauRos, temp, press, rho, kappa, kappaSun, kappaScale, teff, logg) {

    var logE = logTen(Math.E); // for debug output
    var ln10 = Math.log(10.0); //needed to convert logg from base 10 to base e

    var sigma = 5.670373E-5; //Stefan-Boltzmann constant ergs/s/cm^2/K^4  
    var k = 1.3806488E-16; // Boltzmann constant in ergs/K
    var logAmu = Math.log(amu);
    var logSigma = Math.log(sigma);
    var logK = Math.log(k);
    var logAmu = Math.log(amu);
    var ctRow0 = [];
    var ctRow1 = [];
    ctRow0.length = numDeps;
    ctRow1.length = numDeps;
    var convTemp = [
        ctRow0,
        ctRow1
    ];
    //Schwarzschild criterion for convective instability:
    var gamma = 5.0 / 3.0; //adiabatic gamma for ideal monatomic gas - the photon gas is negligible in stars w convection
    var gammaFac = gamma / (gamma - 1.0); // yeah, yeah - I know it's 2.5, but let's show where it comes from for the record...
    var invGamFac = 1.0 / gammaFac;
    //CHEAT: Set gammaThing to value that makes convection just disappear at bottom of mid-F star (7000 K)
    //double gammaThing = 1.60;
    //double invGamThing = 1.0 / gammaThing;
    var invGamThing;
    //System.out.println("gammaThing " + gammaThing);

    var deltaP, deltaT; //, dlnPdlnT;
    var dlnTdlnP, dlnMudlnP, deltaMu;
    var Hp, logHp;
    //double HpSun = 1.2535465715411615E7;  //cm, as computed by GrayStar at depth index=36
    var HpSun = 2.0E7; //cm, approximately as computed by GrayStar at depth index=36
    var logHpSun = Math.log(HpSun);
    //Compute the presure scale height as a reality check:
    var HpRefDep = 36; //index of reference depth for computing pressure scale height
    logHp = press[1][HpRefDep] - rho[1][HpRefDep] - ln10 * logg;
    Hp = Math.exp(logHp);
    //Try scaling gamma to "fix" the convective boundary
    //invGamThing = invGamFac * HpSun/Hp;

    //System.out.println("Hp/HpSun " + Hp/HpSun);

    var mmw = mmwFn(numDeps, temp, kappaScale);
    //Search outward for top of convection zone
    var isStable = false;
    var iBound = numDeps - 1; //initialize index of depth where convection begins to bottom of atmosphere
    for (var i = numDeps - 2; i > 0; i--) {

        //System.out.println("Hp " + Hp);
        //1st order finite difference - erratic?
        //double deltaP = press[1][i] - press[1][i-1];
        //double deltaT = temp[1][i] - temp[1][i-1];
        //Try "2nd order" finite difference - non-uniform spacing in deltaT
        deltaP = press[1][i + 1] - press[1][i - 1];
        deltaT = temp[1][i + 1] - temp[1][i - 1];
        deltaMu = (mmw[i + 1] - mmw[i]) * amu;
        //dlnPdlnT = deltaP / deltaT;
        dlnTdlnP = deltaT / deltaP;
        dlnMudlnP = deltaMu / deltaP;
        //System.out.format("%12.8f   %12.8f%n", logE * tauRos[1][i], dlnPlndT);
        // This can be finicky - let's say we have not found the radiative zone unless two consecutive layers meet the criterion
        //if (dlnPdlnT > gammaThing) {
        if (dlnTdlnP < invGamFac + dlnMudlnP) {

            //Convectively stable
            if (!isStable) {
                //The previous convectively unstable layer was an isolated anomoly - we're have NOT found the zone!  Reset:
                isStable = true;
                iBound = i;
                //System.out.println("First stable layer was found, tauRos " + logE * tauRos[1][i] + " NOW: isStable " + isStable);
            }
        }
    }

    // console.log("Convec: iBound " + iBound);

    //Radiative zone - leave temperatures alone:
    for (var i = 0; i < iBound; i++) {
        convTemp[0][i] = temp[0][i];
        convTemp[1][i] = temp[1][i];
    }

    var baseTemp = temp[0][iBound];
    var baseLogTemp = temp[1][iBound];
    var baseTau = tauRos[0][iBound];
    var baseLogTau = tauRos[1][iBound];
    //double baseDepth = depths[iBound];

    var mixLSun = 1.0; // convective mixing length in pressure scale heights (H_P)

    var betaSun = 0.5; // factor for square of  convective bubble velocity (range: 0.0 - 1.0)

    var Cp, logCp; //Specific heat capacity at constant pressure
    var mixL = mixLSun; //initialization
    var beta = betaSun; //initialization
    var teffSun = 5778.0;
    var loggSun = 4.44;
    //Shameless fix:
    //It seems mixL and beta need to be temp and press dependent:
    if (teff < teffSun) {
        mixL = mixLSun * Math.pow(teff / teffSun, 4.0); //lower teff -> smaller mixL -> steeper SAdGrad
        beta = betaSun * Math.pow(teff / teffSun, 4.0); //lower teff -> smaller beta -> steeper SAdGrad
    }
    mixL = mixL * Math.pow(loggSun / logg, 2.0); // lower logg -> larger mixL -> smaller sAdGrad
    beta = beta * Math.pow(loggSun / logg, 2.0); // lower logg -> larger beta -> smaller sAdGrad

    /*
     //Shameless fix:
     beta = betaSun;  // no fix?
     mixL = mixLSun * Math.pow(Hp / HpSun, 4.0);  //lower teff -> smaller Hp -> smaller mixL -> steeper SAdGrad
     //mixL = mixL * Math.pow(logg / loggSun, 4.0); // lower logg -> smaller mixL -> larger sAdGrad
     */
    var logMixL = Math.log(mixL);
    var logBeta = Math.log(beta);
    var logFluxSurfBol = logSigma + 4.0 * Math.log(teff);
    // This will get hairy when we take it super-adiabatic so let's take it *really* easy and make every factor and term clear:
    var logInvGamFac = Math.log(invGamFac);
    //Get the mean molecular weight in amu from State - Row 0 is "mu" in amu:
    var mu, logMu, logFctr1, logFctr2, logFctr3;
    var nextTemp, lastTemp, nextTemp2;
    //Adiabatic dT/dx gradients in various coordinates
    //tau, logTau space
    var logAdGradTauMag, logAdGradLogTauMag, adGradLogTau;
    //SuperAdiabatic dT/dx gradients in various coordinates
    var deltaTau, logDeltaTau, deltaLogTau, logDeltaLogTau;
    var sAdGradLogTau, logSadGradR, logSadGradTau, logSadGradLogTau;
    var lastLogTau;
    //r space:
    var logAdGradRMag, adGradR;
    //SuperAdiabatic dT/dx gradients in various coordinates
    var deltaR, logDeltaR;
    /*
     double sAdGradR;
     double lastDepth;
     */

    lastTemp = baseTemp;
    lastLogTau = baseLogTau;
    //lastDepth = baseDepth;

    //console.log("tauRos[1][i]   (tauRos[1][i]-lastLogTau)   adGradLogTau   rho[1][i]   kappa[1][i]   lastTemp   nextTemp");
    for (var i = iBound; i < numDeps; i++) {

        mu = mmw[i];
        logMu = Math.log(mu);
        logFctr1 = logMu + logAmu - logK;
        //System.out.println("logFactr1 " + logE*logFctr1 + " logInvGamFac " + logE*logInvGamFac + " logg " + logg);
        logCp = Math.log(5.0 / 2.0) - logFctr1; //ideal monatomic gas - underestimate that neglects partial ionization

        // ** Caution: These are log_e of the *magnitude* of the temperature gradients!
        //The adiabatic dT/dTau in r space
        logAdGradRMag = logInvGamFac + logFctr1 + ln10 * logg; //logg is in base 10

        //This is baaad stuff - remember our tuaRos scale has *nothing* to do with our kappa values!
        //The adiabatic dT/dTau in tau space - divide dT/dr by rho and kappa and make it +ve becasue we're in tau-space:
        //Bad fake to fix artificially small dT/dr at low Teff - use kappaSun instead of kappa
        logAdGradTauMag = logAdGradRMag - rho[1][i] - kappa[1][i];
        //The adiabatic dT/dLnTau in log_e(tau) space
        logAdGradLogTauMag = tauRos[1][i] + logAdGradTauMag;
        //Build the T(tau) in the convection zone:
        // Work in logTau space - numerically safer??
        adGradLogTau = Math.exp(logAdGradLogTauMag); //No minus sign - logTau increases inward...
        nextTemp = lastTemp + adGradLogTau * (tauRos[1][i] - lastLogTau);
        //console.log(" " + logE * tauRos[1][i] + " " + logE*(tauRos[1][i]-lastLogTau) + " " + adGradLogTau + " " + logE*rho[1][i] + " " + logE*kappa[1][i] + " " + lastTemp + " " + nextTemp);
        /*
         // Do in geometric depth space
         adGradR = Math.exp(logAdGradRMag); // no minus sign - our depths *increase* inwards (they're NOT heights!)
         nextTemp = lastTemp + adGradR * (depths[i] - lastDepth);  
         
         //System.out.format("%12.8f   %12.8f   %12.8f   %7.1f   %7.1f%n", logE*tauRos[1][i], (depths[i] - lastDepth), adGradR, lastTemp, nextTemp);
         */
        //Okay - now the difference between the superadiabatic and adiabatic dT/dr:
        logFctr2 = rho[1][i] + logCp + 2.0 * logMixL;
        // ** NOTE ** Should temp in the following line be the *convective* temp of the last depth???
        // logg is in base 10 - convert to base e
        logFctr3 = 3.0 * (ln10 * logg - Math.log(lastTemp)) / 2.0;
        //Difference between SuperAdibatic dT/dr and Adiabtic dT/dr in r-space - Carroll & Ostlie 2nd Ed. p. 328
        //System.out.println("logFluxSurfBol " + logE * logFluxSurfBol + " logFctr2 " + logE * logFctr2 + " logFctr1 " + logE * logFctr1 + " logFctr3 " + logE * logFctr3 + " logBeta " + logE * logBeta);
        logDeltaR = logFluxSurfBol - logFctr2 + 2.0 * logFctr1 + logFctr3 - 0.5 * logBeta;
        logDeltaR = 2.0 * logDeltaR / 3.0; //DeltaR is above formula to the 2/3 power

        //This is baaad stuff - remember our tuaRos scale has *nothing* to do with our kappa values!
        //Bad fake to fix artificially small dT/dr at low Teff - use kappaSun instead of kappa
        logDeltaTau = logDeltaR - rho[1][i] - kappa[1][i];
        logDeltaLogTau = tauRos[1][i] + logDeltaTau;
        sAdGradLogTau = adGradLogTau + Math.exp(logDeltaLogTau);
        //System.out.format("%12.8f   %12.8f   %12.8f   %12.8f%n", logE*tauRos[1][i], logE*logDeltaR, logE*logDeltaTau, logE*logDeltaLogTau);
        nextTemp2 = lastTemp + sAdGradLogTau * (tauRos[1][i] - lastLogTau);
        /*
         // Do in geometric depth space
         sAdGradR = adGradR + Math.exp(logDeltaR);
         nextTemp2 = lastTemp + sAdGradR * (depths[i] - lastDepth);
         */
        // set everything to nextTemp2 for superadibatic dT/dr, and to nexTemp for adiabatic dT/dr 
        convTemp[0][i] = nextTemp2;
        convTemp[1][i] = Math.log(nextTemp2);
        lastTemp = nextTemp2;
        lastLogTau = tauRos[1][i];
        //lastDepth = depths[i];
    }

    return convTemp;
};









