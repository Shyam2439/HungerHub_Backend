
const Vendor = require('../models/vendor');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dotEnv = require('dotenv');

dotEnv.config();

const secretKey = process.env.WhatIsYourName 

const vendorRegister = async(req,res)=>{
    const {username, email, password}= req.body;
    try{
        const vendorEmail = await Vendor.findOne({email});
        if(vendorEmail){
            return res.status(400).json("Email already taken");
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        const newVendor = new Vendor({
            username,
            email,
            password:hashedPassword
        });
        await newVendor.save();

        res.status(201).json({message:"Vendor Registerd Successfully"});

        console.log("registerd");
    }catch(error){
            console.error(error);
            res.status(500).json({error:"Internal sever error"})
    }

}


const vendorLogin = async(req,res)=>{
        const{email,password} = req.body;
        try{
                const vendor = await Vendor.findOne({email});
                if(!vendor || !(await bcrypt.compare(password,vendor.password))){
                    return res.status(401).json({error:"Invalid username or password incorrect"})  
            }
                const token = jwt.sign({vendorId: vendor._id},secretKey,{expiresIn : "1h"})

                const vendorId = vendor._id;

            res.status(200).json({sucess : "Login sucessfull",token,vendorId})
            console.log(email,"this is token",token);
        }catch(error){
            console.log(error);
            res.status(500).json({error: "Internal server error"});
        }
}


const getAllVendors = async(req,res)=>{
    try {
        const vendor =await Vendor.find().populate('firm');
        res.json({vendor})
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Internal server error"});
    }
}


const getVendorById = async(req,res)=>{
    const vendorId = req.params.id;
    try {
        const vendor = await Vendor.findById(vendorId).populate('firm');

        if(!vendor){
            return res.status(404).json({error : "venodr not found"})
        }
        
       const firm = vendor.firm[0]; 
        res.status(200).json({ vendorFirmId: firm._id, firmName: firm.firmName });
        console.log("Firm Name:", firm.firmName);
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Internal server error"});
    }
}

module.exports = {vendorRegister,vendorLogin,getAllVendors,getVendorById}

