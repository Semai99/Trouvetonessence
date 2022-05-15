// importation de bcrypt pour hasher le mdp 
const bcrypt = require("bcryptjs");

//importation pour chiffrer l'email 
const cryptojs = require("crypto-js");

//importation models de la base de donnée User.js
const User = require("../models/signup.js");


console.log(User);

//signup pour enregistrer le nouvel utilisateur dans la bd

exports.signup = (req, res, next) => {
console.log("email");
console.log(req.body.email);

console.log("password");
console.log(req.body.password);

// chiffrer l'email avant de l'envoyer dans la bdd
const emailCryptoJs = cryptojs.HmacSHA256(req.body.email,`${process.env.CRYPTOJS_EMAIL}`).toString();

// hasher le mdp avant de l'envoyer dans la bdd 
  
const saltRounds = 10;
bcrypt.genSalt(saltRounds, function(err, salt){
bcrypt.hash(req.body.password, salt, function(err, hash){
    // ce qui va etre enregistré dans mongoDB
    const user = new User({
        email : emailCryptoJs,
        password : hash
    });
    console.log("CONTENU user : dans la bd");
    console.log(user);

    // envoyer le user dans la bdd 
    user
    .save()
    .then(() => res.status(201).json({ status: "ok", message : "Utilisateur créé et sauvegardé"}))
    .catch((error) => res.status(500).json({error : "Email déjà utilisé"}));
});

});

};

// login pour s'authentifier 
exports.login =(req, res, next) => {
    // le contenu de la requete
    //console.log("CONTENU REQ.BODY.email : principale/user.js");
    //console.log(req.body.email);

    //console.log("CONTENU REQ.BODY.password : principale/user.js");
    //console.log(req.body.password);

    // chiffrer l'email de la requete

    const emailCryptoJs = cryptojs.
    HmacSHA256(req.body.email,`${process.env.CRYPTOJS_EMAIL}`)
    .toString();
    console.log("Email");
    console.log(emailCryptoJs);

    // chercher dans la bd si l'utilisateur est bien présent 
    User.findOne({email:emailCryptoJs})
    // si le mail n'est pas present
    .then((user)=>{
        if(!user){
            return res.status(400).json({error : "Utilisateur inexistant"})
        }
        // controler la validité du password envoyé par le front
        bcrypt
        .compare(req.body.password, user.password)
        .then((controlPassword) =>{
            console.log(controlPassword);
        // si le mdp est correct/incorrect 

        if(controlPassword){
          res.status(202).json({status: "loginOk", message: "le mdp est correct"})
          
        }else{
            res.status(401).json({error: "le mdp est incorrect"})

        }

        })
        .catch((error) => res.status(500).json({error}))
    })
    .catch((error)=> res.status(500).json({error}));
    
    

};
