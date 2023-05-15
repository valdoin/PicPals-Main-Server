const { User } = require("../model/User")
const bcrypt = require("bcryptjs")

const jwt = require('jsonwebtoken')
const jwtSecret = require("./jwtVariables")

//gere les requetes d'inscription au service
//renvoie une requete contenant un cookie de connexion et l'user id
exports.register = async (req, res, next) => {
    const { name, phone, password } = req.body //recuperation du corps de la requete

    if(await User.findOne({phone})){
      return res.status(400).json({ message: "phone number already in base" })
    }
    //on verifie la longueur mini du mdp
    if(password.length < 6) {
        return res.status(400).json({ message: "password less than 6 characters"})
    }
    
    //on hash le mdp de la requete puis on crée l'utilisateur dans la base de données
    bcrypt.hash(password, 10).then(async (hash) => {
        await User.create({
          name,
          phone,
          password: hash,
        })
        //on signe la reponse avec le cookie contenant le token de connection puis on envoie la reponse avec code 201
        .then((user) => {
            const maxAge = 3 * 60 * 60;
            const token = jwt.sign(
              { id: user._id, name, phone, role: user.role },
              jwtSecret,
              {
                expiresIn: maxAge, // 3hrs in sec
              }
            );
            res.cookie("jwt", token, {
              httpOnly: true,
              maxAge: maxAge * 1000, // 3hrs in ms
            });
            res.status(201).json({
              message: "User successfully created",
              id: user._id,
              name: user.name,
            });
        })
        .catch((error) =>
            res.status(400).json({
              message: "User not successful created",
              error: error.message,
            })
        );
    });
};

//gere les requetes de connexion au service
//renvoie un cookie de connection et l'user id
exports.login = async (req, res, next) => {
    const { phone, password } = req.body
    // verifie si les champs phone et password ne sont pas vides
    if (!phone || !password) {
      return res.status(400).json({
        message: "phone or Password not present",
      })
    }
    try {
        //on cherche l'utilisateur en base
      const user = await User.findOne({ phone })
      //si aucun ne corresponds on renvoie un 400
      if (!user) {
        res.status(400).json({
          message: "Login not successful",
          error: "User not found",
        })
      } else {
        // on compare le mdp de la requete avec le hash de celui en base
        bcrypt.compare(password, user.password).then(function (result) {
            // puis, si on a un resultat on signe le cookie avec le token de connection puis on envoie la reponse 200
            if (result) {
              const maxAge = 3 * 60 * 60;
              const token = jwt.sign(
                { id: user._id, name: user.name, phone, role: user.role },
                jwtSecret,
                {
                  expiresIn: maxAge, // 3hrs in sec
                }
              );
              res.cookie("jwt", token, {
                httpOnly: true,
                maxAge: maxAge * 1000, // 3hrs in ms
              });
              res.status(201).json({
                message: "User successfully Logged in",
                id: user._id,
                name: user.name,
              });
            } else {
              res.status(400).json({ message: "Login not succesful" });
            }
          });
        }
      } catch (error) {
        res.status(400).json({
          message: "An error occurred",
          error: error.message,
        });
      }
}

//pas utilisé va servir a faire l'update de post/ commentaire
exports.update = async (req, res, next) => {
    const { role, id } = req.body

    if(role && id){ //check role and id present 
        if(role === "admin"){    //check if role is admin
            await User.findById(id)
            .then((user) => {
                //check if user is not admin
                if (user.role !== "admin"){

                    try{
                        user.role = role
                        user.save()
                        res.status(201).json({  message: "update successful"    })
                        } catch (err){
                        res
                            .status(400)
                            .json({ message: "an error occured", error: err.message })
                            process.exit(1)
                    }
                } else {
                    res.status(400).json({  message: "user is already an admin" })
                }
            })
            .catch((err) => {
                res.status(400).json({  message: "an error occured", error: err.message })
            })
        } else {
            res.status(400).json({
                message: "Role is not admin",
            })
        }
    } else {
        res.status(400).json({  message: "role or id not present" })
    }
}

//gere les requete de suppression d'utilisateur
//renvoie l'user ayant été supprimé
exports.deleteUser = async (req, res, next) => {
    const { id } = req.body
    await User.findByIdAndDelete(id)
        .then(user => 
            res.status(201).json({  message: "user successfully deleted", user   }))
        .catch(err => {
            res.status(400).json({  message: "an error occured", error: err.message })
        })
}

//gere les demandes d'ami
exports.requestFriend = async (req, res, next) => {
    const token = req.cookies.jwt
    const { phone } = req.body

    try{
      //il s'agit de la cible de la demande d'ami
      target = await User.findOne({ phone })
    }
    catch(err){
      res.status(400).json({
        message: "error while finding targeted user",
        error: err.message
      })
    }
    if(token){
      if(target){
        jwt.verify(token, jwtSecret, (err, decodedToken) => {
          if(err){
              res.status(401).json({ message: "token error" })
          } 
          else {
              User.findById(decodedToken.id).then((user) => {
                
                //si on a deja envoyé la demande
                if(user.friendRequestSent.includes(target._id)){
                  
                  res.status(400).json({ message: "user already requested" })
                }
                //si l'user a deja la target en ami
                else if(user.friends.includes(target._id)){
                  res.status(400).json({ message: "user already friend" })
                }
                //si l'user qu'on demande nous a demandé auparavant, on l'ajoute aux amis
                else if(user.friendRequestReceived.includes(target._id)){
                  
                  user.friends.push(target._id)
                  target.friends.push(user._id)

                  user.populate('friendRequestReceived')
                  user.populate('friendRequestSent')

                  user.friendRequestReceived.pull({_id: target._id})
                  target.friendRequestSent.pull({_id: user._id})
                  
                  user.save()
                  target.save()

                  res.status(200).json({ message: "friend added" })
                }
                //si la cible est l'user
                else if(target._id === decodedToken.id){
                  res.status(401).json({ message: "cannot send a friend request to self" })
                }
                //sinon, on envoie la demande
                else{
                  user.friendRequestSent.push(target._id)
                  target.friendRequestReceived.push(user._id)
                  user.save()
                  target.save()
                  res.status(201).json({ message: "friend request sent" })
                }
              })
              .catch(err => res.status(400).json({
                message: "error while updating users",
                error: err.message
              }))
          }
      })
      }
      else{
        res.status(400).json({ message: "could not find such user" })
      }
    }
    else{
      res.status(400).json({ message: "no token provided" })
    }

}

exports.getFriendList = async (req, res, next) => {
  const token = req.cookies.jwt
  if(token){
      jwt.verify(token, jwtSecret, (err, decodedToken) => {
        if(err){
            res.status(401).json({ message: "token error" })
        } 
        else {
            User.findById(decodedToken.id).populate({path: "friends", select:"name phone -_id"}).then((user) => {
              if(user) {
                res.status(200).json({friends: user.friends})
              }
              else {
                return res.status(400).json({message: "no such user."})
              }


            })
            .catch((err) => {
              return res.status(400).json({message: "could not get friend list", error: err})
            })
          }
  })
}
      
  else{
    res.status(400).json({ message: "no token provided" })
  }

}

exports.deleteFriend = async (req, res, next) => {
  const token = req.cookies.jwt
  const { phone } = req.body

  if(token){
      jwt.verify(token, jwtSecret, (err, decodedToken) => {
        if(err){
            res.status(401).json({ message: "token error" })
        } 
        else {
            User.findById(decodedToken.id).then((user) => {
              if(user) {
                User.findOne({ phone }).then((target) => {
                  if(target){
                    try{
                      user.friends.pull({_id : target._id})
                      target.friends.pull({_id: user._id})
                      user.save()
                      target.save()
                      res.status(200).json({ message: "friend successfully deleted" })
                    }catch(err){
                      return res.status(400).json({ message: "could not delete user", error : err })
                    }
                  }
                  else{
                    return res.status(400).json({ message: "this friend does not exist" })
                  }
                })
                .catch((err) => {
                  return res.status(400).json({ message: "could not delete user", error : err })
                })
              }
              else {
                return res.status(400).json({message: "no such user."})
              }
            })
          }
      })
    }else{
    res.status(400).json({ message: "no token provided" })
  }
}