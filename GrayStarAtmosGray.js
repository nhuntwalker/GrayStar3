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

// Global variables - Doesn't work - scope not global!




var c = 2.9979249E+10; // light speed in vaccuum in cm/s
var sigma = 5.670373E-5; //Stefan-Boltzmann constant ergs/s/cm^2/K^4  
var k = 1.3806488E-16; // Boltzmann constant in ergs/K
var h = 6.62606957E-27; //Planck's constant in ergs sec
var ee = 4.80320425E-10; //fundamental charge unit in statcoulombs (cgs)
var mE = 9.10938291E-28; //electron mass (g)
var GConst = 6.674e-8;         //Newton's gravitational constant (cgs)
//Conversion factors
var amu = 1.66053892E-24; // atomic mass unit in g
var eV = 1.602176565E-12; // eV in ergs
var rSun = 6.955e10;   // solar radii to cm
var mSun = 1.9891e33;  // solar masses to g
var lSun = 3.846e33;   // solar bolometric luminosities to ergs/s

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
    var tauRos = [dummy0, dummy1];
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
    var temp = [dummy0, dummy1];
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
var kappas = function(numDeps, kappaScale, logg, loggSun, teff, teffSun, radius, massX, massZ, tauRos, temp, tempSun) {

    var GConst = 6.674e-8;         //Newton's gravitational constant (cgs)
    var logGConst = Math.log(GConst);
    var rSun = 6.955e10;   // solar radii to cm
    var logRSun = Math.log(rSun);

    var hotT = 6000.0;  //hotter than this in K and we use hot star formula

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

    // Approximate mass density in atmosphere by scaling with logg and radius, then diluting:
    var dilute = 5.0e-5; //tuned to give rho ~10^-1 g/cm^-3 in Sun's atmosphere
    var logRhoStarFake = Math.log(3.0 / 4.0 / Math.PI) - logGConst + logg - Math.log(rSun * radius);
    var rhoStarFake = dilute * Math.exp(logRhoStarFake);
    // Do the same for Sun for consistency
    var logRhoSunFake = Math.log(3.0 / 4.0 / Math.PI) - logGConst + loggSun - logRSun;
    var rhoSunFake = dilute * Math.exp(logRhoSunFake);

    var kappa = [dummy0, dummy1];
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


    //Star:
    var numerator;
    var denominator;
    var logHelp, help, reScale;
    for (var i = 0; i < numDeps; i++) {

        // No!  According to ATLAS9 ABROSS values, kappa almost independent of logg - !?
        reScale = kappaScale;

        numerator = kappaFac(numDeps, hotT, logRhoStarFake, temp[1][i], massX, massZ);
        denominator = kappaFac(numDeps, hotT, logRhoSunFake, tempSun[1][i], massX, massZSun);

        kappa[0][i] = reScale * kappaRosSun[0][i] * (numerator / denominator);

    }

    return kappa;
};

var kappaFac = function(numDeps, hotT, logRho, logTemp, massX, massZ) {

    var kapFac = 0.0;

    // These values tuned to produce total kappas of right order of magnitude
    var constbf = 2.34e19; // b-f pre-factor cm^2/g
    var constff = 3.68e15; // f-f pre-factor cm^2/g
    var constes = 0.2;  // Thomson scattering from free electron pre-factor cm^2/g
    var constHm = 3.9e-31 / 0.02; // H^- b-f pre-factor with 1/0.02 factor from Z term cm^2/g
    //should b-b opacity rho-and T- scaling track b-f oapcity?

    var logRhoT35;
    var rhoT35;
    var logHmTerm;
    var HmTerm;

    logRhoT35 = logRho - 3.5 * logTemp;
    rhoT35 = Math.exp(logRhoT35);
    logHmTerm = Math.log(constHm) + Math.log(massZ) + 0.5 * logRho + 9.0 * logTemp; // H^- b-f term
    HmTerm = Math.exp(logHmTerm);

    if (logTemp < Math.log(hotT)) {
        // Caroll & Ostlie 2nd Ed. Ch. 9 - (1+X) factors do NOT cancel out when we divide kappa_Star/kappa_Sun
//            // Cool stars: kappa_bf + kappa_ff + kappa_H^- + kappa_es
        //           kapFac = rhoT35 * (1.0 + massX) * (constbf * massZ + constff * (1.0 - massZ)) + HmTerm + (1.0 + massX) * constes;
        // Cool stars: kappa_ff + kappa_H^- + kappa_es
        kapFac = rhoT35 * (1.0 + massX) * (constff * (1.0 - massZ)) + HmTerm + (1.0 + massX) * constes;
    }

    if (logTemp >= Math.log(hotT)) {
        // Caroll & Ostlie 2nd Ed. Ch. 9 - (1+X) factors in every term will cancel out when we divide kappa_Star/kappa_Sun
        // Hot stars: kappa_bf + kappa_ff + kappa_es
        kapFac = rhoT35 * (constbf * massZ + constff * (1.0 - massZ)) + constes;
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

        press[0][i] = helpSub * p2;  //Euler
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
var state = function(numDeps, temp, press) {

    //press is a 4 x numDeps array:
    // rows 0 & 1 are linear and log *gas* pressure, respectively
    // rows 2 & 3 are linear and log *radiation* pressure
    // double c = 9.9989E+10; // light speed in vaccuum in cm/s
    // double sigma = 5.670373E-5;   //Stefan-Boltzmann constant ergs/s/cm^2/K^4   
    //double mu = 0.62; // For now: Mean molecular weight in amu
    var mu = 1.0; // Carrol & Ostlie 2nd Ed., p. 293: mu_N = 1.3, mu_I = 0.62

    var k = 1.3806488E-16; // Boltzmann constant in ergs/K
    var amu = 1.66053892E-24; // atomic mass unit in g
    var logK = Math.log(k);
    var logAmu = Math.log(amu);
    var logMuAmu = Math.log(mu) + logAmu;
    var dummy0 = [];
    var dummy1 = [];
    dummy0.length = numDeps;
    dummy1.length = numDeps;
    var rho = [dummy0, dummy1];
    // Declare scatch variables:
    // double logPrad, pRad, pGas, logPgas;
    for (var i = 0; i < numDeps; i++) {

        // Compute LTE bolometric radiation contribution to total HSE pressure
        //logPrad = radFac + 4.0*temp[1][i] ;
        //pRad = Math.exp(logPrad);
        //pGas = press[0][i] - pRad;
        //logPgas = Math.log(pGas);
        rho[1][i] = press[1][i] - temp[1][i] + (logMuAmu - logK);
        rho[0][i] = Math.exp(rho[1][i]);
        //System.out.println("i " + i + " rho " + rho[0][i]);
    }

    return rho;
};

/** 
 * Returns vector of numDep linear geometric DEPTHS below top of atmosphere - in
 * cm (cgs) for consistency with log(g) units
 *
 * *May not be useful - scale depends on log(g)
 */
var depthScale = function(numDeps, tauRos, kappa, rho) {

    //double ln10 = Math.log(10.0); //handy wee quantity 
    //log_10 Rosseland optical depth scale  
    var depths = [];
    depths.length = numDeps;
    // Upper bounday condition: 
    // Zero point at top of atmosphere - this can be shifted later?
    // log(z) cannot really correspond to zero 
    //double logZ1 = -10.0;  // log(cm)
    //depths[0] = Math.pow(10.0, logZ1);  //cm
    var z1 = 0; //cm
    depths[0] = z1;
    var minZ = 1.0E5; // = 1km - Minimum increase in depth from one point to the next

    // declare scratch variables
    //double deltaX, deltaZ, logZ2;
    var deltaX, deltaZ, z2, z3, help, logHelp,
            h, k1, k2, k3, k4, logH, logK1, logK2, logK3, logK4;
    //Euler's method for depth at 2nd point in
    // Need to avoid using rho at upper boundary, so rho value must be taken at y_n+2 on all RHSs
    deltaX = tauRos[1][1] - tauRos[1][0];
    logHelp = tauRos[1][0] - kappa[1][0] - rho[1][2];
    //help = ( tauRos[0][0] / kappa[0][0] ) / rho[0][1];
    help = Math.exp(logHelp);
    deltaZ = (deltaX) * help;
    z2 = z1 + deltaZ;
    depths[1] = z2;
    //z1 =z2;
    for (var i = 2; i < numDeps; i++) {

        //Euler's method:
        deltaX = tauRos[1][i] - tauRos[1][i - 1];
        help = (tauRos[0][i] / kappa[0][i]) / rho[0][i];
        deltaZ = (deltaX) * help;
        z2 = z1 + deltaZ;
        depths[i] = z2;
        z1 = z2;
        /*
         
         // CAUTION; Do NOT use 4th O R-K - produces jaggedness in T(depth) relation
         
         // 4th order Runge-Kutte (mid-point), p. 705, Numerical Recipes in F77, 2nd Ed.
         h = tauRos[1][i] - tauRos[1][i-2];
         logH = Math.log(h);
         
         //k1 = h * ( tauRos[0][i-2] / kappa[0][i-2] ) / rho[0][i-1];
         //k2 = h * ( tauRos[0][i-1] / kappa[0][i-1] ) / rho[0][i-1];
         //k3 = k2;
         //4 = h * ( tauRos[0][i] / kappa[0][i] ) / rho[0][i];
         
         logK1 = logH + tauRos[1][i-2] - kappa[1][i-2] - rho[1][i];
         logK2 = logH + tauRos[1][i-1] - kappa[1][i-1] - rho[1][i];
         logK4 = logH + tauRos[1][i] - kappa[1][i] - rho[1][i];
         
         k1 = Math.exp(logK1);
         k2 = Math.exp(logK2);
         k3 = Math.exp(logK2);
         k4 = Math.exp(logK4);
         
         z3 = z1 + (k1/6.0) + (k2/3.0) + (k3/3.0) + (k4/6.0);
         if (z3 <= z2){
         z3 = z2 + minZ;
         }
         depths[i] = z3;
         z1 = z2;
         z2 = z3;
         */
    }

    return depths;
};

var tCorr = function(numDeps, tauRos, temp) {

    // updated temperature structure
    var tRow0 = new Array(numDeps);
    var tRow1 = new Array(numDeps);
    var newTemp = new Array(2);
    newTemp[0] = tRow0;
    newTemp[1] = tRow1;

    var tcDamp = 0.5; // damp the temperature corrections, Delta T, by this *multiplicative* factor

    var logE = logTen(Math.E); // for debug output

    var planckBol = planckBolom(numDeps, temp);
    var jayBol = jayBolom(numDeps, tauRos, temp);

    var logRatio, ratio, JminusB, logDeltaTemp;
    var sign = 1.0; //initialize for positive JminusB
    var deltaTemp = new Array(numDeps);
    deltaTemp[numDeps - 1] = 0.0; // J -> B as tau --> infinity

    for (var iTau = 0; iTau < numDeps; iTau++) {
        // Compute a 1st order T correction:  Compute J-B so that DeltaT < 0 if J < B:
// avoid direct subtraction of two large almost equal numbers, J & B:

        logRatio = planckBol[1][iTau] - jayBol[1][iTau];
        ratio = Math.exp(logRatio);
        JminusB = jayBol[0][iTau] * (1.0 - ratio);
        if (JminusB < 0.0) {
            sign = -1.0;
        }

        // DeltaB/DeltaT ~ dB/dT & dB/dT = (4/pi)sigma*T^3
        logDeltaTemp = Math.log(Math.abs(JminusB)) + Math.log(Math.PI) - Math.log(4.0) - logSigma - 3.0 * temp[1][iTau];
        //System.out.println("iTau " + iTau + " logRatio " + logE * logRatio + " ratio " + ratio + " JminusB " + JminusB + " logDeltaTemp " + logE * logDeltaTemp);
        deltaTemp[iTau] = sign * Math.exp(logDeltaTemp) * tcDamp;
        //System.out.println("iTau " + iTau + " deltaTemp[iTau]/temp[0][iTau] " + deltaTemp[iTau] / temp[0][iTau] + " deltaTemp[iTau] " + deltaTemp[iTau]);

        sign = 1.0; //reset sign

        newTemp[0][iTau] = temp[0][iTau] + deltaTemp[iTau];
        newTemp[1][iTau] = Math.log(newTemp[0][iTau]);

    } //iTau loop

    return newTemp;

};

// method jay computes bolometric angle-averaged mean intensity, J, for Gray LTE case:
var jayBolom = function(numDeps, tauRos, temp) {

    // For bolometric J on a Gray Tau scale in LTE: 
    // J(Tau) = 1/2 * Sigma_Tau=0^Infty { E_1(|t-Tau|)*Planck_Bol(Tau) }

    var logE = logTen(Math.E); // for debug output

    var E1; //E_1(x)

    var logInteg, integ, integ1, integ2, logInteg1, logInteg2, meanInteg, logMeanInteg, term, logTerm;
    var deltaTau, logDeltaTau; //accumulator
    var accum = 0.0; //accumulator

    var jRow0 = new Array(numDeps);
    var jRow1 = new Array(numDeps);
    var jayBol = new Array(2);
    jayBol[0] = jRow0;
    jayBol[1] = jRow1;

    var planckBol = planckBolom(numDeps, temp);
    var meanPlanck, logMeanPlanck;

    // Top of atmosphere: Jay = 0.5S = 0.5B - - LTE Eddington-Barbier result for J
    jayBol[0][0] = 0.5 * planckBol[0][0];
    jayBol[1][0] = Math.log(jayBol[0][0]);
    //System.out.println("iTau=0, planckBol[1][0]= " + logE * planckBol[1][0] + " jayBol[1][0]= " + logE * jayBol[1][0] + " jayBol[1][0] - planckBol[1][0]: " + logE * (jayBol[1][0] - planckBol[1][0]));

    // if E_1(t-Tau) evaluated at Tau=bottom of atmosphere, then just set Jay=B at that Tau - we're deep enough to be thermalized
    // and we don't want to let lambda operation implicitly include epths below bottom of model where B=0 implicitly 
    var tiny = 1.0e-14;  //tuned to around maxTauDIff at Tau_Ros ~ 3
    var maxTauDiff;


    //stipulate the {|t-Tau|} grid at which E_1(x)B will be evaluated - necessary to sample the 
    // sharply peaked integrad properly
    var numInteg = 15;
    var minLog10TmTau = -6;
    var maxLog10TmTau = logTen(30.0);
    var deltaInteg = (maxLog10TmTau - minLog10TmTau) / numInteg;
    var log10TmTau;
    var tmTau = new Array(numInteg);
    var logE1 = new Array(numInteg);
    var jFloat;
    for (var j = 0; j < numInteg; j++) {
        jFloat = 1.0 * j;
        log10TmTau = minLog10TmTau + jFloat * deltaInteg;
        tmTau[j] = Math.pow(10.0, log10TmTau);
        // Evaluate E_1(x) and log(E_1(x)) one and for all here
        E1 = expOne(tmTau[j]);
        logE1[j] = Math.log(E1);
        //System.out.println("j " + j + " logTmTau[j] " + log10TmTau + " tmTau[j] " + tmTau[j] + " E1 " + E1 + " logE1[j] " + logE * logE1[j]);
    }
    var thisTau, logThisPlanck;

    //Prepare 1D vectors for Interpol.interpol:
    var logTauRos = new Array(numDeps);
    var logPlanck = new Array(numDeps);
    for (var k = 0; k < numDeps; k++) {
        logTauRos[k] = tauRos[1][k];
        logPlanck[k] = planckBol[1][k];
    }

    //Outer loop over Taus where Jay(Tau) being computed:
    // Start from top and work down to around tau=1 - below that assume we're thermalized with J=B
//        System.out.println("iTau: " + (numDeps - 1) + " planckBol[1][iTau]: " + planckBol[1][numDeps - 1] + " jayBol[1][iTau] " + jayBol[1][numDeps - 1]
//                + " jayBol[1][iTau] - planckBol[1][iTau]: " + (jayBol[1][numDeps - 1] - planckBol[1][numDeps - 1]));
    //       System.out.println("iTau: " + (numDeps-1) + " tauRos[1][iTau] " + logE*tauRos[1][numDeps-1]
    //               + " jayBol[1][iTau] - planckBol[1][iTau]: " + logE*(jayBol[1][numDeps-1] - planckBol[1][numDeps-1]));
    for (var iTau = 0; iTau < numDeps; iTau++) {
        jayBol[0][iTau] = planckBol[0][iTau]; //default initialization J=B
        jayBol[1][iTau] = planckBol[1][iTau]; //default initialization logJ = logB

        if (tauRos[0][iTau] < 30.0) {

            // initial test - don't let E_1(x) factor in integrand run off bottom of atmosphere
            // - we have no emissivity down there and J will drop below B again, like at surface!
            maxTauDiff = Math.abs(tauRos[0][numDeps - 1] - tauRos[0][iTau]);
            //System.out.println("maxTauDiff= " + maxTauDiff + " expOne(maxTauDiff)= " + expOne(maxTauDiff));
            if (expOne(maxTauDiff) < tiny) {

                //System.out.println("Lambda operation triggered, iTau = " + iTau + " tauRos[0][iTau] " + tauRos[0][iTau]);

// We're above thermalization depth: J may not = B:
                //Inner loop over depths contributing to each Jay(iTau):
                // work outward from t=Tau (ie. i=iTau) piece-wise  
                accum = 0.0;
                // conribution from depths above Tau:
//                    for (int i = iTau - 1; i >= 0; i--) {
                for (var i = 0; i < numInteg - 1; i++) {

                    // LTE bolometric source function is Bolometric Planck function
                    // Extended trapezoidal rule for non-uniform abscissae - the is an exponential integrand!             
                    // We cannot evaluate E_1(x) at x=0 - singular:

                    thisTau = tauRos[0][iTau] - tmTau[i + 1];

                    // Make sure we're still in the atmosphere!
                    if (thisTau > 0) {
                        //System.out.println("We're in the atmosphere!");
                        // interpolate log(B(log(Tau)) to the integration abscissa
                        logThisPlanck = interpol(logTauRos, logPlanck, Math.log(thisTau));
                        logInteg2 = logE1[i + 1] + logThisPlanck;
                        integ2 = Math.exp(logInteg2);
                        //System.out.println("i+1 " + (i+1) + " thisTau " + thisTau + " logThisPlanck " + logE * logThisPlanck + " logInteg2 " + logE * logInteg2);

                        thisTau = tauRos[0][iTau] - tmTau[i];
                        logThisPlanck = interpol(logTauRos, logPlanck, Math.log(thisTau));
                        logInteg1 = logE1[i] + logThisPlanck;
                        integ1 = Math.exp(logInteg1);
                        //System.out.println("i " + i + " thisTau " + thisTau + " logThisPlanck " + logE * logThisPlanck + " logInteg1 " + logE * logInteg1);

                        deltaTau = tmTau[i + 1] - tmTau[i];
                        logDeltaTau = Math.log(deltaTau);
                        //System.out.println("i " + " deltaTau " + deltaTau);

                        meanInteg = 0.5 * (integ1 + integ2); //Trapezoid rule
                        logMeanInteg = Math.log(meanInteg);

                        // System.out.println("above: i = " + i + " tauRos[0][i] = " + tauRos[0][i] + " absTauDiff = " + absTauDiff + " E1 = " + E1);
                        logTerm = logMeanInteg + logDeltaTau;
                        term = Math.exp(logTerm);
                        accum = accum + term;
                    } // thisTau > 0
                } // i ("t") loop, above iTau 
                jayBol[0][iTau] = 0.5 * accum;  //store what we have.

                // conribution from depths below Tau:
                // include iTau itself so we don't miss the area under the central peak of E_1(x) - the expOne function
                // will protect itself from the x=0 singularity using variable 'tiny'

                accum = 0.0;
                //for (int i = iTau + 1; i < numDeps; i++) {
                for (var i = 0; i < numInteg - 1; i++) {

                    // We cannot evaluate E_1(x) at x=0 - singular:
                    // Extended trapezoidal rule for non-uniform abscissae - the is an exponential integrand! 
                    thisTau = tauRos[0][iTau] + tmTau[i + 1];

                    // make sure we're still in the atmosphere!
                    if (thisTau < tauRos[0][numDeps - 1]) {

                        logThisPlanck = interpol(logTauRos, logPlanck, Math.log(thisTau));
                        logInteg2 = logE1[i + 1] + logThisPlanck;
                        integ2 = Math.exp(logInteg2);

                        thisTau = tauRos[0][iTau] + tmTau[i];
                        logThisPlanck = interpol(logTauRos, logPlanck, Math.log(thisTau));
                        logInteg1 = logE1[i] + logThisPlanck;
                        integ1 = Math.exp(logInteg1);

                        meanInteg = 0.5 * (integ1 + integ2); //Trapezoid rule
                        logMeanInteg = Math.log(meanInteg);
                        deltaTau = tmTau[i + 1] - tmTau[i];

                        logDeltaTau = Math.log(deltaTau);
                        // System.out.println("below: i = " + i + " tauRos[0][i] = " + tauRos[0][i] + " absTauDiff = " + absTauDiff + " E1 = " + E1);
                        // LTE bolometric source function is Bolometric Planck function 

                        // LTE bolometric source function is Bolometric Plnack function
                        logTerm = logMeanInteg + logDeltaTau;
                        term = Math.exp(logTerm);
                        accum = accum + term;

                    }// if thisTau < tauRos[0][numDeps-1]
                } // i ("t") loop, below iTau

                jayBol[0][iTau] = jayBol[0][iTau] + 0.5 * accum;
                jayBol[1][iTau] = Math.log(jayBol[0][iTau]);

            } //if branch for E_1(x) safely dwindling away before reaching bottom of atmosphere
        } // if branch for above thermalization depth of Tau=10? 
        //System.out.println("iTau: " + iTau + " planckBol[1][iTau]: " + logE * planckBol[1][iTau] + " jayBol[1][iTau] " + logE * jayBol[1][iTau]
        //        + " jayBol[1][iTau] - planckBol[1][iTau]: " + logE * (jayBol[1][iTau] - planckBol[1][iTau]));
        //System.out.println("iTau: " + iTau + " tauRos[1][iTau] " + logE * tauRos[1][iTau]
        //        + " jayBol[1][iTau] - planckBol[1][iTau]: " + logE * (jayBol[1][iTau] - planckBol[1][iTau]));

    } //iTau loop

    return jayBol;

};

// Compute linear and logarithmic bolometric Planck fn at all depths one and for all:
var planckBolom = function(numDeps, temp) {

    var planckRow0 = new Array(numDeps);
    var planckRow1 = new Array(numDeps);
    var planckBol = new Array(2);
    planckBol[0] = planckRow0;
    planckBol[1] = planckRow1;

    for (var i = 0; i < numDeps; i++) {
        planckBol[1][i] = logSigma + 4.0 * temp[1][i] - Math.log(Math.PI);
        planckBol[0][i] = Math.exp(planckBol[1][i]);
    }

    return planckBol;
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
        var accum = 0.0;  //accumulator
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






