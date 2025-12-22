const User = require("../models/User");
const jwt = require("jsonwebtoken");

const generateToken = (id)=>{
    return jwt.sign({id}, process.env.JWT_SECRET,{expiresIn:"7d"})
};

exports.registerUser = async(req, res)=>{
    try{
        const {name, phone, email, password, collegeName, branch, role} = req.body;
        if(!name || !phone || !password){
            return res.status(400).json({message:"Name, phone and password are required"});
        }
        const existing = await User.findOne({phone});
        if(existing){
            return res.status(400).json({message:"Phone already registered"})
        }

        const user = await User.create({
            name,
            phone,
            email,
            password,
            collegeName,
            branch,
            role:role||"student"
        });

        return res.status(201).json({
            message:"Registraction successful",
            token:generateToken(user._id),
            user,
        });
    }catch(error){
     console.error(error);
     res.status(500).json({message:"Server error"})
    }
}

exports.loginUser = async (req,res)=>{
    try{
     const {phone, password} = req.body;
     const user = await User.findOne({phone});
     if(!user){
        return res.status(400).json({message:"Invalid credentials"})
     }

     const isMatch = await user.matchPassword(password);
     if(!isMatch) return res.status(400).json({message:"Invalid credictional"})

      return res.status(200).json({message:"Login successful", token:generateToken(user._id),
        user,
      });

    }catch(error){
        console.error(error);
        res.status(500).json({message:"Server error"})
    }
}