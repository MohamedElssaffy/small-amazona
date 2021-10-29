import jwt from 'jsonwebtoken';

const signToken = (user) => {
  const token = jwt.sign(
    {
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
  return token;
};

const isAuth = async (req, res, next) => {
  const { authorization } = req.headers;

  if (authorization) {
    const token = authorization.slice(7, authorization.length);

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).send({ message: 'Invlid Token' });
      } else {
        req.user = decoded;
        next();
      }
    });
  } else {
    res.status(401).send({ message: 'Please Login' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user?.isAdmin) {
    next();
  } else {
    res
      .status(401)
      .send({ message: 'You Dont Have Permission to do this action' });
  }
};

export { signToken, isAuth, isAdmin };
