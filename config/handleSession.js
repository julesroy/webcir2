function handleSession(req, res, next, options = {}) {
    const { requireNoSession, requireSession, redirectNoSession, redirectSession } = options;

    // Vérifie si les cookies et la session existent
    const hasCookies = req.cookies && req.cookies.idUser && req.cookies.email && req.cookies.username;
    const hasSession = req.session && req.session.user;

    // Si les cookies existent mais pas la session, on crée la session
    if (!hasSession && hasCookies) {
        req.session.user = {
            idUser: req.cookies.idUser,
            email: req.cookies.email,
            username: req.cookies.username
        };
    }

    // Logique de redirection en fonction des options
    if (requireNoSession && (hasSession || hasCookies)) {
        return res.redirect(redirectSession || '/profil');
    } else if (requireSession && !hasSession) {
        return res.redirect(redirectNoSession || '/authentification/signin');
    }

    // Si tout est bon, on laisse passer la requête
    next();
}

module.exports = handleSession;