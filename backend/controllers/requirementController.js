const Requirement = require('../models/Requirement');

// @desc    Create a new requirement (Public)
// @route   POST /api/requirements
// @access  Public
const createRequirement = async (req, res) => {
    try {
        const requirement = await Requirement.create(req.body);
        res.status(201).json(requirement);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all requirements (Agent/Admin)
// @route   GET /api/requirements
// @access  Private (Agent/Admin)
const getRequirements = async (req, res) => {
    try {
        const requirements = await Requirement.find({}).sort({ createdAt: -1 });
        res.json(requirements);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get requirement by ID
// @route   GET /api/requirements/:id
// @access  Private (Agent/Admin)
const getRequirementById = async (req, res) => {
    try {
        const requirement = await Requirement.findById(req.params.id);
        if (requirement) {
            res.json(requirement);
        } else {
            res.status(404).json({ message: 'Requirement not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a requirement
// @route   PUT /api/requirements/:id
// @access  Private (Agent/Admin)
const updateRequirement = async (req, res) => {
    try {
        const requirement = await Requirement.findById(req.params.id);
        if (!requirement) {
            return res.status(404).json({ message: 'Requirement not found' });
        }

        const updatedRequirement = await Requirement.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.json(updatedRequirement);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a requirement
// @route   DELETE /api/requirements/:id
// @access  Private (Agent/Admin)
const deleteRequirement = async (req, res) => {
    try {
        const requirement = await Requirement.findById(req.params.id);
        if (!requirement) {
            return res.status(404).json({ message: 'Requirement not found' });
        }

        await Requirement.findByIdAndDelete(req.params.id);
        res.json({ message: 'Requirement deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createRequirement,
    getRequirements,
    getRequirementById,
    updateRequirement,
    deleteRequirement,
};
