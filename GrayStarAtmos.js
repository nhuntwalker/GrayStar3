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

"use strict"; //testing only!

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
var phxSunTeff = 5777.0;
var phxSunLogEg = Math.log(10.0) * 4.44; //base e!

//Corresponding Tau_1200 grid (ie. lambda_0 = 1200 nm):    
var phxSunTau64Fn = function() {
    var phxSunTau64 = [
        0.00000000000000000e+00, 9.99999999999999955e-07, 1.34596032415536424e-06,
        1.81160919420041334e-06, 2.43835409826882661e-06, 3.28192787251147086e-06,
        4.41734470314007309e-06, 5.94557070854439435e-06, 8.00250227816105150e-06,
        1.07710505603676912e-05, 1.44974067037263168e-05, 1.95129342263596224e-05,
        2.62636352765333536e-05, 3.53498110503010944e-05, 4.75794431400941376e-05,
        6.40400427119728256e-05, 8.61953566475303296e-05, 1.16015530173997152e-04,
        1.56152300600049664e-04, 2.10174801133248704e-04, 2.82886943462596928e-04,
        3.80754602122237184e-04, 5.12480587696093120e-04, 6.89778537938765824e-04,
        9.28414544519474432e-04, 1.24960914129198688e-03, 1.68192432488086880e-03,
        2.26380340952144672e-03, 3.04698957090350784e-03, 4.10112707055130048e-03,
        5.51995432128156800e-03, 7.42963950759494912e-03, 1.00000000000000002e-02,
        1.34596032415536416e-02, 1.81160919420041312e-02, 2.43835409826882656e-02,
        3.28192787251147072e-02, 4.41734470314006464e-02, 5.94557070854439424e-02,
        8.00250227816105216e-02, 1.07710505603676912e-01, 1.44974067037263136e-01,
        1.95129342263596224e-01, 2.62636352765332992e-01, 3.53498110503010240e-01,
        4.75794431400941440e-01, 6.40400427119728384e-01, 8.61953566475303168e-01,
        1.16015530173997152e+00, 1.56152300600049664e+00, 2.10174801133248704e+00,
        2.82886943462596640e+00, 3.80754602122236800e+00, 5.12480587696092608e+00,
        6.89778537938765824e+00, 9.28414544519474432e+00, 1.24960914129198672e+01,
        1.68192432488086880e+01, 2.26380340952144640e+01, 3.04698957090350528e+01,
        4.10112707055129536e+01, 5.51995432128157312e+01, 7.42963950759495040e+01,
        1.00000000000000000e+02
    ];
    return phxSunTau64;
};
var logPhxSunTau64 = function() {

    var phxSunTau64 = phxSunTau64Fn();

    var logE = logTen(Math.E);
    var numPhxDep = phxSunTau64.length;
    var logPhxSunTau64 = [];
    logPhxSunTau64.length = numPhxDep;
    for (var i = 1; i < numPhxDep; i++) {
        logPhxSunTau64[i] = Math.log(phxSunTau64[i]);
    }
    logPhxSunTau64[0] = logPhxSunTau64[1] - (logPhxSunTau64[numPhxDep - 1] - logPhxSunTau64[1]) / numPhxDep;
    return logPhxSunTau64;
};
var phxSunTemp = function(teff, numDeps, tauRos) {

    var phxSunTeff = 5777.0;
    var phxSunLogEg = Math.log(10.0) * 4.44; //base e!    

    var logE = logTen(Math.E);
    //Theoretical radiative/convective model from Phoenix V15:
    var phxSunTemp64 = [
        3.75778887392339840e+03, 3.75778887392339840e+03, 3.78480175327941504e+03,
        3.81385432525541760e+03, 3.84360130602512768e+03, 3.87340585446516608e+03,
        3.90300184305606656e+03, 3.93231689265254528e+03, 3.96137919852984000e+03,
        3.99027119028325824e+03, 4.01910484194699648e+03, 4.04798292490651008e+03,
        4.07699548886169152e+03, 4.10623218035810816e+03, 4.13574364539801920e+03,
        4.16548101060783104e+03, 4.19541371831173824e+03, 4.22551121760088000e+03,
        4.25571229065970624e+03, 4.28594188575783232e+03, 4.31613168919769152e+03,
        4.34620698440244928e+03, 4.37603327507328960e+03, 4.40564394765877952e+03,
        4.43507740841559296e+03, 4.46439148496796224e+03, 4.49375530130093952e+03,
        4.52341166116436480e+03, 4.55357281866347264e+03, 4.58446079852491520e+03,
        4.61663974201107520e+03, 4.65052341797810624e+03, 4.68623381803595456e+03,
        4.72408924142126144e+03, 4.76494152329308416e+03, 4.80984310271200128e+03,
        4.85897778977827584e+03, 4.91315894280032960e+03, 4.97390461818851328e+03,
        5.04531167969494336e+03, 5.12680296183560704e+03, 5.22061204180252480e+03,
        5.32918534350649152e+03, 5.46202432323604352e+03, 5.61966782651567040e+03,
        5.80986721241013376e+03, 6.03911828822760320e+03, 6.23433005487621120e+03,
        6.53458311644527488e+03, 6.87429103746811904e+03, 7.29999981509928192e+03,
        7.66682942009826304e+03, 7.94223816217841024e+03, 8.16133659245977728e+03,
        8.35020013757955200e+03, 8.52047273964030720e+03, 8.67812135633704064e+03,
        8.82687568743616768e+03, 8.96926538519515648e+03, 9.10706359999037824e+03,
        9.24154121553023488e+03, 9.37363000902155008e+03, 9.50427569030960000e+03,
        9.63219702937432192e+03
    ];
    // interpolate onto gS3 tauRos grid and re-scale with Teff:
    var phxSunTemp = [];
    phxSunTemp.length = numDeps;
    var scaleTemp = [];
    scaleTemp.length = 2;
    scaleTemp[0] = [];
    scaleTemp[1] = [];
    scaleTemp[0].length = numDeps;
    scaleTemp[1].length = numDeps;
    for (var i = 0; i < numDeps; i++) {
        phxSunTemp[i] = interpol(logPhxSunTau64(), phxSunTemp64, tauRos[1][i]);
        scaleTemp[0][i] = teff * phxSunTemp[i] / phxSunTeff;
        scaleTemp[1][i] = Math.log(scaleTemp[0][i]);
        //System.out.println("tauRos[1][i] " + logE * tauRos[1][i] + " scaleTemp[1][i] " + logE * scaleTemp[1][i]);
    }

    return scaleTemp;
};
var phxSunPGas = function(grav, numDeps, tauRos) {

    var phxSunTeff = 5777.0;
    var phxSunLogEg = Math.log(10.0) * 4.44; //base e!    

    var logE = logTen(Math.E);
    var logEg = Math.log(grav); //base e!

    //Theoretical radiative/convective model from Phoenix V15:
    var phxSunPGas64 = [
        1.00000000000000005e-04, 7.28828683006412544e+01, 8.61732126528505984e+01,
        1.01843641855932976e+02, 1.20317369304629504e+02, 1.42093296011949696e+02,
        1.67758727999644384e+02, 1.98004769223716256e+02, 2.33644726494082176e+02,
        2.75635953319757664e+02, 3.25104809120938880e+02, 3.83378880706399168e+02,
        4.52022443862726592e+02, 5.32877321364649344e+02, 6.28113128741022208e+02,
        7.40284569989930496e+02, 8.72399144145001216e+02, 1.02799724165148560e+03,
        1.21124571517496000e+03, 1.42704756928025427e+03, 1.68117132827309248e+03,
        1.98040330055171296e+03, 2.33272402439094176e+03, 2.74752260927171264e+03,
        3.23584954067544384e+03, 3.81071167175796544e+03, 4.48742481283848128e+03,
        5.28403135449994368e+03, 6.22178478543013120e+03, 7.32571484052561408e+03,
        8.62531818498740864e+03, 1.01553497268350960e+04, 1.19567104697253520e+04,
        1.40775115384306991e+04, 1.65743702896828832e+04, 1.95139034178162464e+04,
        2.29742653550211872e+04, 2.70468752817440448e+04, 3.18381441391788864e+04,
        3.74704748898233472e+04, 4.40799661582952512e+04, 5.18080650391892096e+04,
        6.07793647633492224e+04, 7.10351288049853440e+04, 8.24259773567987968e+04,
        9.44866985169806080e+04, 1.06329924298695632e+05, 1.17862219382348656e+05,
        1.28295128203359424e+05, 1.36933948396180352e+05, 1.43493910023715958e+05,
        1.48487688700034048e+05, 1.52795575243316608e+05, 1.56932489940248512e+05,
        1.61140965195830048e+05, 1.65564070780028256e+05, 1.70312554701480352e+05,
        1.75486986284790656e+05, 1.81187218697219744e+05, 1.87518050413513344e+05,
        1.94593473563783808e+05, 2.02540389901047584e+05, 2.11500759107428064e+05,
        2.21643078023966592e+05
    ];
    var numPhxDeps = phxSunPGas64.length; //yeah, I know, 64, but that could change!
    var logPhxSunPGas64 = [];
    logPhxSunPGas64.length = numPhxDeps;
    for (var i = 0; i < phxSunPGas64.length; i++) {
        logPhxSunPGas64[i] = Math.log(phxSunPGas64[i]);
    }

    // interpolate onto gS3 tauRos grid and re-scale with Teff:
    var phxSunPGas = [];
    phxSunPGas.length = numDeps;
    var logPhxSunPGas = [];
    logPhxSunPGas.length = numDeps;
    var scalePGas = [];
    scalePGas.length = 2;
    scalePGas[0] = [];
    scalePGas[1] = [];
    scalePGas[0].length = numDeps;
    scalePGas[1].length = numDeps;
    for (var i = 0; i < numDeps; i++) {
        logPhxSunPGas[i] = interpol(logPhxSunTau64(), logPhxSunPGas64, tauRos[1][i]);
        scalePGas[1][i] = logEg + logPhxSunPGas[i] - phxSunLogEg;
        scalePGas[0][i] = Math.exp(scalePGas[1][i]);
        //System.out.println("scalePGas[1][i] " + logE * scalePGas[1][i]);
    }

    return scalePGas;
};
var phxSunNe = function(grav, numDeps, tauRos, scaleTemp, kappaScale) {

    var phxSunTeff = 5777.0;
    var phxSunLogEg = Math.log(10.0) * 4.44; //base e!    

    var k = 1.3806488E-16; // Boltzmann constant in ergs/K
    var logK = Math.log(k);

    var logE = Math.log10(Math.E);
    var logEg = Math.log(grav); //base e!
    var logEkappaScale = Math.log(kappaScale);
    //Theoretical radiative/convective model from Phoenix V15:
    var phxSunPe64 = [
        1.53086468021591745e-07, 5.66518458165471424e-03, 6.72808433760886656e-03,
        8.00271552708326656e-03, 9.51809762875982208e-03, 1.13117438884935648e-02,
        1.34299756939525680e-02, 1.59287848014678144e-02, 1.88751877391284448e-02,
        2.23491173128862976e-02, 2.64457686695698400e-02, 3.12779350532322240e-02,
        3.69791374171045888e-02, 4.37078139287801024e-02, 5.16503829681397248e-02,
        6.10221573903118336e-02, 7.20768505868849536e-02, 8.51123959415642752e-02,
        1.00475763241309840e-01, 1.18571138726675232e-01, 1.39870552376136714e-01,
        1.64923053015554560e-01, 1.94357063774820192e-01, 2.28928720249475840e-01,
        2.69525262128246720e-01, 3.17192228891198592e-01, 3.73192988074577856e-01,
        4.39058414038311360e-01, 5.16615873984964544e-01, 6.08066526878471680e-01,
        7.16264581324812416e-01, 8.44657163125294336e-01, 9.97267452897639808e-01,
        1.17915717019238848e+00, 1.39715732004723136e+00, 1.66026825646718432e+00,
        1.97886823850223904e+00, 2.36716912384854112e+00, 2.84540915928013805e+00,
        3.44853013665125120e+00, 4.21529199485384704e+00, 5.21488490421314560e+00,
        6.56660005867586432e+00, 8.55643059606379776e+00, 1.16931723772200080e+01,
        1.71629079266534368e+01, 2.75152019254691616e+01, 4.18720694941323264e+01,
        7.66283674228108288e+01, 1.45995186997127872e+02, 3.04766672331673792e+02,
        5.44151864837275328e+02, 8.17181982032739072e+02, 1.11216222784450608e+03,
        1.43633935534913856e+03, 1.79603721463325728e+03, 2.19692608617747040e+03,
        2.64548745663525184e+03, 3.14931730610757952e+03, 3.71721361233669376e+03,
        4.35932065708395904e+03, 5.08736399892079296e+03, 5.91634943413070720e+03,
        6.85104524590000384e+03
    ];
    var numPhxDeps = phxSunPe64.length; //yeah, I know, 64, but that could change!
    var logPhxSunPe64 = [];
    logPhxSunPe64.length = numPhxDeps;
    for (var i = 0; i < phxSunPe64.length; i++) {
        logPhxSunPe64[i] = Math.log(phxSunPe64[i]);
    }

    // interpolate onto gS3 tauRos grid and re-scale with Teff:
    var phxSunPe = [];
    phxSunPe.length = numDeps;
    var logPhxSunPe = [];
    logPhxSunPe.length = numDeps;
    var logScalePe = [];
    logScalePe.length = numDeps;
    var scaleNe = [];
    scaleNe.length = 2;
    scaleNe[0] = [];
    scaleNe[1] = [];
    scaleNe[0].length = numDeps;
    scaleNe[1].length = numDeps;
    for (var i = 0; i < numDeps; i++) {
        logPhxSunPe[i] = interpol(logPhxSunTau64(), logPhxSunPe64, tauRos[1][i]);
        logScalePe[i] = logEg + logPhxSunPe[i] - phxSunLogEg - logEkappaScale;
        scaleNe[1][i] = logScalePe[i] - scaleTemp[1][i] - logK;
        scaleNe[0][i] = Math.exp(scaleNe[1][i]);
        //System.out.println("scaleNe[1][i] " + logE * scaleNe[1][i]);
    }

    return scaleNe;
};
//Try to recover the opacity as lambda_0 = 1200 nm:
var phxSunKappa = function(numDeps, tauRos, kappaScale) {

    var phxSunTau64 = phxSunTau64Fn();

    var logEkappaScale = Math.log(kappaScale);
    //Theoretical radiative/convective model from Phoenix V15:
    var phxSunRho64 = [
        4.13782346832222649e-16, 3.02095569469690462e-10, 3.54633225055968270e-10,
        4.15928280610231993e-10, 4.87569895799879155e-10, 5.71381142733345291e-10,
        6.69468927495419999e-10, 7.84278468388299388e-10, 9.18654436245877140e-10,
        1.07590983297567878e-09, 1.25990158939278389e-09, 1.47513757382262481e-09,
        1.72688539188771193e-09, 2.02128936476074103e-09, 2.36554000030610158e-09,
        2.76809615861929229e-09, 3.23884396019102352e-09, 3.78934920783997866e-09,
        4.43317360103421215e-09, 5.18621173362546736e-09, 6.06707380164391496e-09,
        7.09757215466433105e-09, 8.30337600953291647e-09, 9.71426731449415417e-09,
        1.13650770268615465e-08, 1.32964932176367733e-08, 1.55557163673284530e-08,
        1.81974840999693492e-08, 2.12855768344032029e-08, 2.48940684847852482e-08,
        2.91068454381155637e-08, 3.40213170202104799e-08, 3.97519122004400661e-08,
        4.64290866159173997e-08, 5.41967343519845744e-08, 6.32144869975830899e-08,
        7.36729431582295057e-08, 8.57774421976652924e-08, 9.97399445761737017e-08,
        1.15721981027072251e-07, 1.33967659681056212e-07, 1.54620178670780798e-07,
        1.77690495649821781e-07, 2.02608223525831620e-07, 2.28481547026651195e-07,
        2.53309018291389784e-07, 2.74195019891415717e-07, 2.94373976046088894e-07,
        3.05614181338722779e-07, 3.09912387277346887e-07, 3.05484245799381785e-07,
        3.00519445088246902e-07, 2.98007120264342719e-07, 2.97336159154754909e-07,
        2.97854109132361140e-07, 2.99327766949861546e-07, 3.01691329467384893e-07,
        3.04944348605014908e-07, 3.09125225055924192e-07, 3.14302162196028050e-07,
        3.20569231575000568e-07, 3.28044919674719785e-07, 3.36858977566225440e-07,
        3.47271781807407172e-07
    ];
    var phxSunRadius64 = [
        9.98760000000000000e+10, 9.98660572490945152e+10, 9.98645871807186304e+10,
        9.98631098643980160e+10, 9.98616245003269760e+10, 9.98601306458076032e+10,
        9.98586280682994048e+10, 9.98571166428681216e+10, 9.98555962828737792e+10,
        9.98540668955362944e+10, 9.98525283799022080e+10, 9.98509805586940416e+10,
        9.98494232096872704e+10, 9.98478561022866944e+10, 9.98462789875034752e+10,
        9.98446916403608064e+10, 9.98430938763377024e+10, 9.98414855440511616e+10,
        9.98398665329129600e+10, 9.98382367818977152e+10, 9.98365962762478464e+10,
        9.98349450434777856e+10, 9.98332831693342848e+10, 9.98316107506358144e+10,
        9.98299278514395904e+10, 9.98282344996977408e+10, 9.98265306530218624e+10,
        9.98248161610832000e+10, 9.98230907740896512e+10, 9.98213541602841472e+10,
        9.98196058171550848e+10, 9.98178450629064448e+10, 9.98160711682936960e+10,
        9.98142833645708160e+10, 9.98124806655167488e+10, 9.98106617425436544e+10,
        9.98088251712680448e+10, 9.98069695137641728e+10, 9.98050931816160256e+10,
        9.98031941655960192e+10, 9.98012715884401664e+10, 9.97993275763000704e+10,
        9.97973698841808128e+10, 9.97954186071983616e+10, 9.97935139683624704e+10,
        9.97917197632915456e+10, 9.97901090800493440e+10, 9.97886636105590528e+10,
        9.97874361487011200e+10, 9.97864521731274880e+10, 9.97857037165240960e+10,
        9.97851119909964288e+10, 9.97845890321633152e+10, 9.97840832513957504e+10,
        9.97835682848038784e+10, 9.97830286360697344e+10, 9.97824528501662336e+10,
        9.97818311493811456e+10, 9.97811545315540224e+10, 9.97804143368400768e+10,
        9.97796020159347072e+10, 9.97787090120484864e+10, 9.97777268638511104e+10,
        9.97766460582020224e+10
    ];
    var numPhxDeps = phxSunRadius64.length;
    var phxSunKappa64 = [];
    phxSunKappa64.length = numPhxDeps;
    var logPhxSunKappa64 = [];
    logPhxSunKappa64.length = numPhxDeps;
    //double[] logPhxSunRho64 = new double[numPhxDeps];
    //double[] logPhxSunRadius64 = new double[numPhxDeps];

//Fix to get right depth scale and right line strengths:
// Yeah - everywhere ya go - opacity fudge
    var fudge = 0.25;
    var logFudge = Math.log(fudge);
    var deltaRho, deltaRadius, deltaTau, logDeltaRho, logDeltaRadius, logDeltaTau;
    var logE = logTen(Math.E);
    for (var i = 1; i < numPhxDeps; i++) {

//Renormalize radii before taking difference
//Caution: Radius *decreases* with increasing i (inward) and we'll be taking the log:
        deltaRadius = (1.0e-11 * phxSunRadius64[i - 1]) - (1.0e-11 * phxSunRadius64[i]);
        deltaRadius = Math.abs(deltaRadius);
        //restore to cm:
        deltaRadius = 1.0e11 * deltaRadius;
        //Renormalize before taking rho difference
        deltaRho = (1.0e9 * phxSunRho64[i]) - (1.0e9 * phxSunRho64[i - 1]);
        deltaRho = Math.abs(deltaRho);
        //Restore g/cm^3:
        deltaRho = 1.0e-9 * deltaRho;
        //Renormalize before taking rho difference
        deltaTau = (1.0e2 * phxSunTau64[i]) - (1.0e2 * phxSunTau64[i - 1]);
        deltaTau = Math.abs(deltaTau);
        deltaTau = 1.0e-2 * deltaTau;
        logDeltaRadius = Math.log(deltaRadius);
        logDeltaRho = Math.log(deltaRho);
        logDeltaTau = Math.log(deltaTau);
        logPhxSunKappa64[i] = logDeltaTau - logDeltaRho - logDeltaRadius - logEkappaScale + logFudge;
        phxSunKappa64[i] = Math.exp(logPhxSunKappa64[i]);
        //System.out.println("logPhxSunKappa64[i] " + logE*logPhxSunKappa64[i]);

    }

    logPhxSunKappa64[0] = logPhxSunKappa64[1];
    phxSunKappa64[0] = phxSunKappa64[1];
    // interpolate onto gS3 tauRos grid and re-scale with Teff:
    var phxSunKappa = [];
    phxSunKappa.length = 2;
    phxSunKappa[0] = [];
    phxSunKappa[1] = [];
    phxSunKappa[0].length = numDeps;
    phxSunKappa[1].length = numDeps;
    for (var i = 0; i < numDeps; i++) {
        phxSunKappa[1][i] = interpol(logPhxSunTau64(), logPhxSunKappa64, tauRos[1][i]);
        phxSunKappa[0][i] = Math.exp(phxSunKappa[1][i]);
        //System.out.println("phxSunKappa[1][i], i= " + i + " " + logE * phxSunKappa[1][i]);
    }

    return phxSunKappa;
};
//Castelli & Kurucz (ALMOST!)
var phxVegaTeff = 9950.0; //actual INCORRECT Teff used in Phoenix model (should have been 9550 -sigh!)
var phxVegaLogEg = Math.log(10.0) * 3.95; //base e
var phxVegaLogEkappaScale = Math.log(10.0) * (-0.5); //base!

//Corresponding Tau_500 grid (ie. lambda_0 = 500 nm):   
var phxVegaTau64Fn = function() {
    var phxVegaTau64 = [
        0.00000000000000000e+00, 1.00000000000000004e-10, 1.57297315730079583e-10,
        2.47424455358884461e-10, 3.89192026739294322e-10, 6.12188611096406130e-10,
        9.62956252459902995e-10, 1.51470433677439602e-09, 2.38258926299323964e-09,
        3.74774895556145216e-09, 5.89510850740025871e-09, 9.27284744151620558e-09,
        1.45859401172503535e-08, 2.29432922784316770e-08, 3.60891828940797229e-08,
        5.67673159613064525e-08, 8.92934642191482617e-08, 1.40456222339119575e-07,
        2.20933867515307984e-07, 3.47523043140230439e-07, 5.46644418403068955e-07,
        8.59856996736334509e-07, 1.35253197498353518e-06, 2.12749649104013246e-06,
        3.34649487265776861e-06, 5.26394660573542543e-06, 8.28004671228647794e-06,
        1.30242912196233633e-05, 2.04868604813359955e-05, 3.22252816145080504e-05,
        5.06895029660801231e-05, 7.97332275225631174e-05, 1.25418226637949074e-04,
        1.97279503937761955e-04, 3.10315364179716846e-04, 4.88117738152716565e-04,
        7.67796099716601789e-04, 1.20772265513446235e-03, 1.89971531799055940e-03,
        2.98820120171229553e-03, 4.70036027890743165e-03, 7.39354054836428853e-03,
        1.16298408199920333e-02, 1.82934274335286202e-02, 2.87750703079705100e-02,
        4.52624131938807600e-02, 7.11965609886321127e-02, 1.11990279327247338e-01,
        1.76157703260379023e-01, 2.77091338680335086e-01, 4.35857237864710867e-01,
        6.85591735576461137e-01, 1.00000000000000000e+00, 1.07841739692903849e+00,
        1.69632161773558221e+00, 2.66826837084713286e+00, 4.19711452381726513e+00,
        6.60194848408189738e+00, 1.03846877513435061e+01, 1.63348350798136970e+01,
        2.56942571094824572e+01, 4.04163767300010406e+01, 6.35738757116481565e+01,
        1.00000000000000000e+02
    ];
    return phxVegaTau64;
};
var logPhxVegaTau64 = function() {

    var phxVegaTau64 = phxVegaTau64Fn();

    var logE = logTen(Math.E);
    var numPhxDep = phxVegaTau64.length;
    var logPhxVegaTau64 = [];
    logPhxVegaTau64.length = numPhxDep;
    for (var i = 1; i < numPhxDep; i++) {
        logPhxVegaTau64[i] = Math.log(phxVegaTau64[i]);
    }
    logPhxVegaTau64[0] = logPhxVegaTau64[1] - (logPhxVegaTau64[numPhxDep - 1] - logPhxVegaTau64[1]) / numPhxDep;
    return logPhxVegaTau64;
};
var phxVegaTemp = function(teff, numDeps, tauRos) {

    var phxVegaTeff = 9950.0; //actual INCORRECT Teff used in Phoenix model (should have been 9550 -sigh!)
    var phxVegaLogEg = Math.log(10.0) * 3.95; //base e
    var phxVegaLogEkappaScale = Math.log(10.0) * (-0.5); //base!    

    var logE = logTen(Math.E);
    //Theoretical radiative/convective model from Phoenix V15:
    var phxVegaTemp64 = [
        5.92666192154309101e+03, 5.92666192154309101e+03, 5.92669171597276090e+03,
        5.92673998930622656e+03, 5.92681897305491384e+03, 5.92694950529302332e+03,
        5.92716641457396599e+03, 5.92752552761684638e+03, 5.92810993487369979e+03,
        5.92903227707427686e+03, 5.93043220345250484e+03, 5.93247494804068447e+03,
        5.93535705326493917e+03, 5.93931461731802392e+03, 5.94462395405969710e+03,
        5.95160056847340456e+03, 5.96062955115910609e+03, 5.97234442427941121e+03,
        5.98799376822690192e+03, 6.00995395792729505e+03, 6.04217083863954394e+03,
        6.08927266539518769e+03, 6.15482922005066484e+03, 6.24095845993735929e+03,
        6.34702439197141939e+03, 6.46752230210132257e+03, 6.59445408379155560e+03,
        6.72080130115506290e+03, 6.84109768032372904e+03, 6.95113817061313694e+03,
        7.04860283942552360e+03, 7.13460514913545467e+03, 7.21354674932631588e+03,
        7.28978629931232808e+03, 7.36559554177949485e+03, 7.44189226318755846e+03,
        7.51906108650742408e+03, 7.59685046298776069e+03, 7.67490002230248228e+03,
        7.75361847195948849e+03, 7.83483766810037559e+03, 7.92234631761687160e+03,
        8.02067697937434696e+03, 8.13521360575207927e+03, 8.27574328647004768e+03,
        8.45212850359107870e+03, 8.67381075095960477e+03, 8.95207036703875929e+03,
        9.30689214747616825e+03, 9.74795486690789039e+03, 1.02809293652303932e+04,
        1.09262232212095878e+04, 1.12593239932788256e+04, 1.15410572182275682e+04,
        1.20102451746046791e+04, 1.31012465922441861e+04, 1.39755996506773790e+04,
        1.49601225189046345e+04, 1.60017842217904235e+04, 1.71032050644639567e+04,
        1.83299248272271325e+04, 1.96750591610957927e+04, 2.11303208351190988e+04,
        2.28754881624451700e+04
    ];
    // interpolate onto gS3 tauRos grid and re-scale with Teff:
    var phxVegaTemp = [];
    phxVegaTemp.length = numDeps;
    var scaleTemp = [];
    scaleTemp.length = 2;
    scaleTemp[0] = [];
    scaleTemp[1] = [];
    scaleTemp[0].length = numDeps;
    scaleTemp[1].length = numDeps;
    for (var i = 0; i < numDeps; i++) {
        phxVegaTemp[i] = interpol(logPhxVegaTau64(), phxVegaTemp64, tauRos[1][i]);
        scaleTemp[0][i] = teff * phxVegaTemp[i] / phxVegaTeff;
        scaleTemp[1][i] = Math.log(scaleTemp[0][i]);
        //System.out.println("tauRos[1][i] " + logE * tauRos[1][i] + " scaleTemp[1][i] " + logE * scaleTemp[1][i]);
    }

    return scaleTemp;
};
var phxVegaPGas = function(grav, numDeps, tauRos) {

    var phxVegaTeff = 9950.0; //actual INCORRECT Teff used in Phoenix model (should have been 9550 -sigh!)
    var phxVegaLogEg = Math.log(10.0) * 3.95; //base e
    var phxVegaLogEkappaScale = Math.log(10.0) * (-0.5); //base!    

    var logE = logTen(Math.E);
    var logEg = Math.log(grav); //base e!

    //Theoretical radiative/convective model from Phoenix V15:
    var phxVegaPGas64 = [
        1.00000000000000005e-04, 1.03180061021383636e-04, 1.05002968345422655e-04,
        1.07871552081389134e-04, 1.12386725052260572e-04, 1.19496313343916537e-04,
        1.30697666356185981e-04, 1.48361992972487070e-04, 1.76258386690715085e-04,
        2.20411975250140330e-04, 2.90535998351765538e-04, 4.02482306184926818e-04,
        5.82567140052077013e-04, 8.75483847795477193e-04, 1.35932010786618583e-03,
        2.17504753883526704e-03, 3.58604002686978935e-03, 6.09998771718679896e-03,
        1.07169005213047595e-02, 1.94122344665836263e-02, 3.59841794245942953e-02,
        6.72855684478238375e-02, 1.24554375514099314e-01, 2.24101975995654207e-01,
        3.86646959394992218e-01, 6.36529574106352247e-01, 1.00343700649801648e+00,
        1.52697716962899532e+00, 2.26349996201742520e+00, 3.29629279099446704e+00,
        4.75030546972967382e+00, 6.80809320973782395e+00, 9.71920175580820889e+00,
        1.38039294970946660e+01, 1.94633310169022842e+01, 2.72009206319020187e+01,
        3.76537976616197625e+01, 5.16414528869924041e+01, 7.02366160217307538e+01,
        9.48405015720874474e+01, 1.27226394963505882e+02, 1.69478952948159872e+02,
        2.23823762506721806e+02, 2.92345015096225097e+02, 3.76222048844978588e+02,
        4.74870843243441925e+02, 5.85652914503416241e+02, 7.04296132837323171e+02,
        8.25563282958302466e+02, 9.46928267959175855e+02, 1.07335181478674599e+03,
        1.22086252441237139e+03, 1.38209820348047128e+03, 1.42038354608713939e+03,
        1.70862293207878497e+03, 2.14866236364070392e+03, 2.81854335114876267e+03,
        3.79724473416333012e+03, 5.19324230258075386e+03, 7.13948492727422672e+03,
        9.83704209840320618e+03, 1.35943082419561761e+04, 1.88366045459964553e+04,
        2.62524123256841995e+04
    ];
    var numPhxDeps = phxVegaPGas64.length; //yeah, I know, 64, but that could change!
    var logPhxVegaPGas64 = [];
    logPhxVegaPGas64.length = numPhxDeps;
    for (var i = 0; i < phxVegaPGas64.length; i++) {
        logPhxVegaPGas64[i] = Math.log(phxVegaPGas64[i]);
    }

// interpolate onto gS3 tauRos grid and re-scale with Teff:
    var phxVegaPGas = [];
    phxVegaPGas.length = numDeps;
    var logPhxVegaPGas = [];
    logPhxVegaPGas.length = numDeps;
    var scalePGas = [];
    scalePGas.length = 2;
    scalePGas[0] = [];
    scalePGas[1] = [];
    scalePGas[0].length = numDeps;
    scalePGas[1].length = numDeps;
    for (var i = 0; i < numDeps; i++) {
        logPhxVegaPGas[i] = interpol(logPhxVegaTau64(), logPhxVegaPGas64, tauRos[1][i]);
        scalePGas[1][i] = logEg + logPhxVegaPGas[i] - phxVegaLogEg;
        scalePGas[0][i] = Math.exp(scalePGas[1][i]);
        //System.out.println("scalePGas[1][i] " + logE * scalePGas[1][i]);
    }

    return scalePGas;
};
var phxVegaNe = function(grav, numDeps, tauRos, scaleTemp, kappaScale) {

    var phxVegaTeff = 9950.0; //actual INCORRECT Teff used in Phoenix model (should have been 9550 -sigh!)
    var phxVegaLogEg = Math.log(10.0) * 3.95; //base e
    var phxVegaLogEkappaScale = Math.log(10.0) * (-0.5); //base!    

    var k = 1.3806488E-16; // Boltzmann constant in ergs/K
    var logK = Math.log(k);

    var logE = logTen(Math.E);
    var logEg = Math.log(grav); //base e!
    var logEkappaScale = Math.log(kappaScale);
    //Theoretical radiative/convective model from Phoenix V15:
    var phxVegaPe64 = [
        4.72002072485995232e-05, 4.86860599791532979e-05, 4.95374579675847434e-05,
        5.08766509824373813e-05, 5.29830852602723504e-05, 5.62962571928286436e-05,
        6.15073327430559335e-05, 6.97031622460308396e-05, 8.25926107249302883e-05,
        1.02862199286890015e-04, 1.34734927270846358e-04, 1.84848712459978671e-04,
        2.63639186140655435e-04, 3.87523342400134094e-04, 5.82367141737887679e-04,
        8.89037494764373859e-04, 1.37240124998838403e-03, 2.13631397713436293e-03,
        3.34991041307789979e-03, 5.29691302460575959e-03, 8.47193682504659984e-03,
        1.37503269072523880e-02, 2.26494500083962054e-02, 3.77313887778134710e-02,
        6.30573524863389245e-02, 1.04294141537741802e-01, 1.68555447892395988e-01,
        2.64385476659441288e-01, 4.01678991133522623e-01, 5.91536883461206586e-01,
        8.46971246490695551e-01, 1.18620359311333967e+00, 1.63751721597473354e+00,
        2.24004471648700143e+00, 3.04197315912985289e+00, 4.10229233843691699e+00,
        5.49478489526292702e+00, 7.30946159460564449e+00, 9.65851834249412100e+00,
        1.26929321198114806e+01, 1.66335694784246328e+01, 2.18272692034725146e+01,
        2.87966183424124722e+01, 3.83435065340652415e+01, 5.18840423796927794e+01,
        7.16147842418639584e+01, 1.00791921801285326e+02, 1.44113729824036938e+02,
        2.08146410010596099e+02, 2.96078444680182940e+02, 4.02722746098501375e+02,
        5.18794407567871303e+02, 6.06231844915437705e+02, 6.38241492986035837e+02,
        7.83101211887763725e+02, 1.01011386935192570e+03, 1.33500379236050821e+03,
        1.81044511775468641e+03, 2.49791613029077826e+03, 3.47361550203666138e+03,
        4.84059855334337863e+03, 6.73990325606538136e+03, 9.37502940878883783e+03,
        1.30918950254820193e+04
    ];
    var numPhxDeps = phxVegaPe64.length; //yeah, I know, 64, but that could change!
    var logPhxVegaPe64 = [];
    logPhxVegaPe64.length = numPhxDeps;
    for (var i = 0; i < phxVegaPe64.length; i++) {
        logPhxVegaPe64[i] = Math.log(phxVegaPe64[i]);
    }

// interpolate onto gS3 tauRos grid and re-scale with Teff:
    var phxVegaPe = [];
    phxVegaPe = numDeps;
    var logPhxVegaPe = [];
    logPhxVegaPe.length = numDeps;
    var logScalePe = [];
    logScalePe.length = numDeps;
    var scaleNe = [];
    scaleNe.length = 2;
    scaleNe[0] = [];
    scaleNe[1] = [];
    scaleNe[0].length = numDeps;
    scaleNe[1].length = numDeps;
    for (var i = 0; i < numDeps; i++) {
        logPhxVegaPe[i] = interpol(logPhxVegaTau64(), logPhxVegaPe64, tauRos[1][i]);
        logScalePe[i] = logEg + phxVegaLogEkappaScale + logPhxVegaPe[i] - phxVegaLogEg - logEkappaScale;
        scaleNe[1][i] = logScalePe[i] - scaleTemp[1][i] - logK;
        scaleNe[0][i] = Math.exp(scaleNe[1][i]);
        //System.out.println("scaleNe[1][i] " + logE * scaleNe[1][i]);
    }

    return scaleNe;
};
//Try to recover the opacity as lambda_0 = 1200 nm:
var phxVegaKappa = function(numDeps, tauRos, kappaScale) {

    var phxVegaTau64 = phxVegaTau64Fn();

    var logEkappaScale = Math.log(kappaScale);
    //Theoretical radiative/convective model from Phoenix V15:
    var phxVegaRho64 = [
        1.37223023525555033e-16, 1.41626154144729084e-16, 1.44150314678269172e-16,
        1.48123868450381874e-16, 1.54381872696320795e-16, 1.64244615143250253e-16,
        1.79805591659528720e-16, 2.04399072972825006e-16, 2.43371389381634857e-16,
        3.05381535266035120e-16, 4.04658625218062506e-16, 5.65060079088544924e-16,
        8.27656644735441331e-16, 1.26547228507548020e-15, 2.01314207075828015e-15,
        3.32823827759883533e-15, 5.72029150223031827e-15, 1.02224805472660837e-14,
        1.89501093450353969e-14, 3.61761582879661581e-14, 7.01351717400695016e-14,
        1.35418361851359771e-13, 2.55025155983697073e-13, 4.59971412683176497e-13,
        7.85290223156380020e-13, 1.26757212771981250e-12, 1.95008670419967345e-12,
        2.89368402824842727e-12, 4.19202236851314695e-12, 5.99359837525162254e-12,
        8.53008593628702862e-12, 1.21376785175710081e-11, 1.72572973426857710e-11,
        2.44343113771720162e-11, 3.43400746676555601e-11, 4.78069147968408779e-11,
        6.58740603564234330e-11, 8.98765392638669218e-11, 1.21560637642731269e-10,
        1.63165474617735588e-10, 2.17382402795025265e-10, 2.87014403511926534e-10,
        3.74453897536819904e-10, 4.80819443523762100e-10, 6.03543249187692372e-10,
        7.34746346150234889e-10, 8.60873424351652219e-10, 9.63722272464669253e-10,
        1.02170752697610886e-09, 1.02830142548489420e-09, 1.00463534341353045e-09,
        9.89790772818917655e-10, 1.06177003365404541e-09, 1.04384077274744122e-09,
        1.18730551703367904e-09, 1.33892557911181482e-09, 1.63509907922796515e-09,
        2.04571150388433141e-09, 2.59448905764241340e-09, 3.30151864821760360e-09,
        4.19852739489000737e-09, 5.36614157540176651e-09, 6.89691211725147016e-09,
        8.86141299252599472e-09
    ];
    var phxVegaRadius64 = [
        1.67000000000000000e+11, 1.66997434824341736e+11, 1.66996000021148224e+11,
        1.66993792340530334e+11, 1.66990434901249573e+11, 1.66985415593276306e+11,
        1.66978091504010590e+11, 1.66967747703703705e+11, 1.66953729005060303e+11,
        1.66935618940256409e+11, 1.66913380644500641e+11, 1.66887368804995331e+11,
        1.66858204504870911e+11, 1.66826596519038635e+11, 1.66793201315707397e+11,
        1.66758557698015289e+11, 1.66723082439006622e+11, 1.66687100184744232e+11,
        1.66650891192972473e+11, 1.66614752631880219e+11, 1.66579066154884308e+11,
        1.66544321171909760e+11, 1.66511040302863800e+11, 1.66479661006683319e+11,
        1.66450420200505585e+11, 1.66423258626350128e+11, 1.66397856575875244e+11,
        1.66373783121292786e+11, 1.66350617201162903e+11, 1.66327999415688385e+11,
        1.66305658414097168e+11, 1.66283448699324646e+11, 1.66261378401786652e+11,
        1.66239566586469635e+11, 1.66218148050891907e+11, 1.66197208457392120e+11,
        1.66176772400093903e+11, 1.66156811150862274e+11, 1.66137260364144562e+11,
        1.66118049813053711e+11, 1.66099136305695648e+11, 1.66080531728826263e+11,
        1.66062302365836456e+11, 1.66044553510948181e+11, 1.66027449353869537e+11,
        1.66011174236419525e+11, 1.65995846949225647e+11, 1.65981457156168640e+11,
        1.65967813697925201e+11, 1.65954317129624390e+11, 1.65939737291530853e+11,
        1.65922026262855011e+11, 1.65903466968833923e+11, 1.65899161977920959e+11,
        1.65868787846637787e+11, 1.65828275959904175e+11, 1.65776089155915100e+11,
        1.65714855838088715e+11, 1.65645832748185791e+11, 1.65570171656197845e+11,
        1.65487724367720032e+11, 1.65397726452453491e+11, 1.65299665551203156e+11,
        1.65191869291644409e+11
    ];
    var numPhxDeps = phxVegaRadius64.length;
    var phxVegaKappa64 = [];
    phxVegaKappa64.length = numPhxDeps;
    var logPhxVegaKappa64 = [];
    logPhxVegaKappa64.length = numPhxDeps;
    //double[] logPhxSunRho64 = new double[numPhxDeps];
    //double[] logPhxSunRadius64 = new double[numPhxDeps];

//Fix to get right depth scale and right line strengths:
// Yeah - everywhere ya go - opacity fudge
    var fudge = 0.02;
    var logFudge = Math.log(fudge);
    var deltaRho, deltaRadius, deltaTau, logDeltaRho, logDeltaRadius, logDeltaTau;
    var logE = logTen(Math.E);
    for (var i = 1; i < numPhxDeps; i++) {

//Renormalize radii before taking difference
//Caution: Radius *decreases* with increasing i (inward) and we'll be taking the log:
        deltaRadius = (1.0e-12 * phxVegaRadius64[i - 1]) - (1.0e-12 * phxVegaRadius64[i]);
        deltaRadius = Math.abs(deltaRadius);
        //restore to cm:
        deltaRadius = 1.0e12 * deltaRadius;
        //Renormalize before taking rho difference
        deltaRho = (1.0e12 * phxVegaRho64[i]) - (1.0e12 * phxVegaRho64[i - 1]);
        deltaRho = Math.abs(deltaRho);
        //Restore g/cm^3:
        deltaRho = 1.0e-12 * deltaRho;
        //Renormalize before taking rho difference
        deltaTau = (1.0e2 * phxVegaTau64[i]) - (1.0e2 * phxVegaTau64[i - 1]);
        deltaTau = Math.abs(deltaTau);
        deltaTau = 1.0e-2 * deltaTau;
        logDeltaRadius = Math.log(deltaRadius);
        logDeltaRho = Math.log(deltaRho);
        logDeltaTau = Math.log(deltaTau);
        logPhxVegaKappa64[i] = logDeltaTau - logDeltaRho - logDeltaRadius - logEkappaScale + logFudge;
        phxVegaKappa64[i] = Math.exp(logPhxVegaKappa64[i]);
        //System.out.println("logPhxSunKappa64[i] " + logE*logPhxSunKappa64[i]);

    }

    logPhxVegaKappa64[0] = logPhxVegaKappa64[1];
    phxVegaKappa64[0] = phxVegaKappa64[1];
    // interpolate onto gS3 tauRos grid and re-scale with Teff:
    var phxVegaKappa = [];
    phxVegaKappa.length = 2;
    phxVegaKappa[0] = [];
    phxVegaKappa[1] = [];
    phxVegaKappa[0].length = numDeps;
    phxVegaKappa[1].length = numDeps;
    for (var i = 0; i < numDeps; i++) {
        phxVegaKappa[1][i] = interpol(logPhxVegaTau64(), logPhxVegaKappa64, tauRos[1][i]);
        phxVegaKappa[0][i] = Math.exp(phxVegaKappa[1][i]);
        //System.out.println("phxVegaKappa[1][i] " + logE * phxVegaKappa[1][i]);
    }

    return phxVegaKappa;
};
/**
 * Compute Rosseland mean extinction coefficient (cm^2/g) structure by scaling
 * from Sun
 *
 */
//var kappas = function(numDeps, kappaScale, tauRos, temp, tempSun, logg, loggSun, teff) {
var kappas = function(mode, numDeps, rho, rhoRef, kappaRef, kappaScale, logg, loggSun, teff, teffSun,
        radius, massX, massZ, tauRos, temp, tempRef, logNumsH3, logNumsH2) {

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
            denominator = kappaFac(numDeps, hotT, logRhoSunFake, tempRef[1][i], massX, massZSun, logNH3, logNH2);
        } else if (mode === 1) {
            numerator = kappaFac(numDeps, hotT, rho[1][i], temp[1][i], massX, massZ, logNH3, logNH2);
            denominator = kappaFac(numDeps, hotT, rhoRef[1][i], tempRef[1][i], massX, massZSun, logNH3, logNH2);
        }

       // if (i == 16) {
       //     console.log("numerator " + numerator + " denominator " + denominator);
       // }

        kappa[0][i] = reScale * kappaRef[0][i] * (numerator / denominator);


        kappa[1][i] = Math.log(kappa[0][i]);
        //console.log("i " + i + " kappa[1] " + logE * kappa[1][i]);
    }

    return kappa;
};
var kappaFac = function(numDeps, hotT, logRho, logTemp, massX, massZ, logNH3, logNH2) {

    var logE = logTen(Math.E); // for debug output

    var kapFac = 0.0;
    // These values tuned to produce total kappas of right order of magnitude
    var fudgebf = 1.0e-3;
    var constbf = fudgebf * 4.34e22; // b-f pre-factor cm^2/g
    var fudgeff = 1.0e-4;
    var constff = fudgeff * 3.68e19; // f-f pre-factor cm^2/g
    var constes = 0.2; // Thomson scattering from free electron pre-factor cm^2/g
    var fudgeHm = 1.0e2;
    var constHm = fudgeHm * 7.9e-33 / 0.02; // H^- b-f pre-factor with 1/0.02 factor from Z term cm^2/g
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
    var midRange = 1500.0; //H^- opacity ramp-down T range

//    if (thisTemp < hotT) {
    if ((thisTemp > 3000.0) && (thisTemp < 6000.0)
            && (logE * logRho > -13.0) && (logE * logRho < -8.0)
            && (massZ > 0.001) && (massZ < 0.03)) {
      //  console.log("Hminus branch " + thisTemp);
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
    } else {
      //  console.log("non-Hminus branch " + thisTemp);
        kapFac = rhoT35 * (1.0 + massX) * (constbf * massZ + constff * (1.0 - massZ)) + (1.0 + massX) * constes;
    }

    logHIbfTerm3 = logHbfFac3 + logNH3 - logRho; //neglects stimualted emission (for now)
    logHIbfTerm2 = logHbfFac2 + logNH2 - logRho; //neglects stimualted emission (for now)
    HIbfTerm = Math.exp(logHIbfTerm3) + Math.exp(logHIbfTerm2);
    if ((thisTemp >= hotT) && (thisTemp < (hotT + midRange))) {
        //console.log("mid Range branch " + thisTemp);
        //HmHotFac = 1.0 - ((thisTemp - hotT) / midRange);
        //HmTermHot = HmTerm * Math.sqrt(HmHotFac);
        //console.log("HmHotFac: " + HmHotFac);
        kapFac = rhoT35 * (constbf * massZ + constff * (1.0 - massZ)) + constes + HIbfTerm; // + HmTermHot;
        //console.log("HIbfTerm " + HIbfTerm);
        //console.log("Middle T: " + Math.exp(logTemp) + " b-f: " + rhoT35 * (constbf * massZ)
        //        + " f-f: " + rhoT35 * (constff * (1.0 - massZ))
        //        + " es: " + constes + " HIbf: " + HIbfTerm + " HmTermHot: " + HmTermHot + " kapFac " + kapFac);
    }

    if (thisTemp >= (hotT + midRange)) {
       // console.log("hot branch " + thisTemp);
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

    //console.log("grav " + grav);
    var logE = logTen(Math.E); // for debug output

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
        //console.log("HYDROSTAT: i " + temp[0][i] + i + " Pgas " + logE * press[1][i] + " Prad " + logE * press[3][i] + " deltaX " + deltaX + " help " + help
        //        + " kappa[0][i] " + kappa[0][i]);
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









