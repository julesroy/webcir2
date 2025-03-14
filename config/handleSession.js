/**
 * @function
 * @description Fonction générique pour gérer la vérification de la session, la création de la session à partir des cookies si nécessaire, et la redirection en fonction de l'état de la session.
 * @param {Object} options - Options pour configurer le comportement de la fonction.
 * @param {boolean} options.requireNoSession - Si true, la fonction vérifie que l'utilisateur n'a pas de session active (pour les pages de connexion/inscription).
 * @param {boolean} options.requireSession - Si true, la fonction vérifie que l'utilisateur a une session active (pour les pages protégées).
 * @param {string} options.redirectNoSession - URL de redirection si l'utilisateur n'a pas de session et que `requireSession` est true.
 * @param {string} options.redirectSession - URL de redirection si l'utilisateur a une session et que `requireNoSession` est true.
 */
function handleSession(req, res, next, options = {}) {
    const { requireNoSession, requireSession, redirectNoSession, redirectSession } = options;

    // Vérifie si la session existe ou si les cookies peuvent créer une session
    const hasSession = req.session.user || (req.cookies.idUser && req.cookies.email && req.cookies.username);

    // Si les cookies existent mais pas la session, on crée la session
    if (!req.session.user && hasSession) {
        req.session.user = {
            idUser: req.cookies.idUser,
            email: req.cookies.email,
            username: req.cookies.username
        };
    }

    // Logique de redirection en fonction des options
    if (requireNoSession && hasSession) {
        return res.redirect(redirectSession || '/profil');
    } else if (requireSession && !hasSession) {
        return res.redirect(redirectNoSession || '/signin');
    }

    // Si tout est bon, on laisse passer la requête
    next();
}

module.exports = handleSession;
