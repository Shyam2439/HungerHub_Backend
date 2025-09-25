const Vendor = require('../models/vendor');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dotEnv = require('dotenv');

dotEnv.config();

const secretKey = process.env.WhatIsYourName;
const vendorRegister = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const vendorEmail = await Vendor.findOne({ email });
        if (vendorEmail) {
            return res.status(400).json("Email already taken");
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newVendor = new Vendor({
            username,
            email,
            password: hashedPassword
        });

        await newVendor.save();
        res.status(201).json({ message: "Vendor Registered Successfully" });
        console.log("Vendor registered:", email);
    } catch (error) {
        console.error("Error in vendorRegister:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// ✅ Login vendor and issue token
const vendorLogin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const vendor = await Vendor.findOne({ email });
        if (!vendor || !(await bcrypt.compare(password, vendor.password))) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const token = jwt.sign({ vendorId: vendor._id }, secretKey, { expiresIn: "1h" });
        res.status(200).json({
            success: "Login successful",
            token,
            vendorId: vendor._id
        });

        console.log(email, "logged in with token:", token);
    } catch (error) {
        console.error("Error in vendorLogin:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// ✅ Get all vendors with firm details
const getAllVendors = async (req, res) => {
    try {
        const vendors = await Vendor.find().populate('firm');
        res.status(200).json({ vendors });
    } catch (error) {
        console.error("Error in getAllVendors:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// ✅ Get a single vendor's firm details by vendor ID
const getVendorById = async (req, res) => {
    const vendorId = req.params.id;
    try {
        const vendor = await Vendor.findById(vendorId).populate('firm');

        if (!vendor) {
            return res.status(404).json({ error: "Vendor not found" });
        }

        const firm = Array.isArray(vendor.firm) ? vendor.firm[0] : vendor.firm;

        if (!firm) {
            return res.status(404).json({ error: "Firm not found for this vendor" });
        }

        res.status(200).json({ vendorFirmId: firm._id, firmName: firm.firmName });
        console.log("Firm Name:", firm.firmName);
    } catch (error) {
        console.error("Error in getVendorById:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = {
    vendorRegister,
    vendorLogin,
    getAllVendors,
    getVendorById
};
