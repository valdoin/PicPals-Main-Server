const { User } = require("../model/User")

//quand l'utilisateur poste, cette fonction est appelée pour mettre a jour les notifs de tous ses amis
exports.createHasPostedNotification = async(id) =>{
    
}


exports.deleteUserNotifications = async (phone) => {
    User.findOne({phone: phone}).then((user) => {
        user.notifications = []
        user.save()
    })
}

//TODO : notif commentaire +gestion notif coté client