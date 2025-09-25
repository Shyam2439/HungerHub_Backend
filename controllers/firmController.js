const Firm = require('../models/Firm');
const Vendor = require('../models/vendor');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads folder exists
const uploadPath = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath);
}

// Multer storage config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

const addFirm = async (req, res) => {
    try {
        const { firmName, area, category, region, offer } = req.body;


        const image = req.file ? req.file.filename : null;

        const vendor = await Vendor.findById(req.vendorId);
        if (!vendor) {
            return res.status(404).json({ message: "Vendor not found" });
        }

         if(vendor.firm.length>0){
            return res.status(400).json({message:"Vendor can have only one firm"});
        }

        const firm = new Firm({
            firmName,
            area,
            category: Array.isArray(category) ? category : [category],
            region: Array.isArray(region) ? region : [region],
            offer,
            image,
            vendor: vendor._id
        });

        const savedFirm = await firm.save();

        const  firmId = savedFirm._id

        vendor.firm.push(savedFirm._id);
        await vendor.save();

        
        return res.status(200).json({ message: "Firm added successfully",  firmId});


    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const deleteFirmById = async (req, res) => {
    try {
        const firmId = req.params.firmId;
        const deleted = await Firm.findByIdAndDelete(firmId);
        if (!deleted) {
            return res.status(404).json({ error: "Firm not found" });
        }
        res.status(200).json({ message: "Firm deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = {
    addFirm: [upload.single('image'), addFirm],
    deleteFirmById
};
