const express = require('express');
const router = express.Router();
const Transaction = require('../models/TransactionSchema'); 

router.get('/all', async (req, res) => {
    try {
        const transactions = await Transaction.find({}).sort({ timestamp: -1 });
        res.status(200).json(transactions);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.delete('/delete', async (req, res) => {
    try {
        const { id } = req.body;
        const deletedTransaction = await Transaction.findOneAndDelete({ _id: id });
        if (!deletedTransaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }
        res.status(200).json({ message: 'Transaction deleted successfully' });
    } catch (error) {
        console.error('Error deleting transaction:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/status', async (req, res)=>{
    const { id, paid, pending } = req.body;

    try{
        const transaction = await Transaction.findById(id);
        if(!transaction){
            return res.status(404).json({ message: 'Transaction not found' });
        }

        if(transaction.amount.paid + transaction.amount.pending !=  + paid + pending){
            return res.status(400).json({ message: `Total amount should be , ${transaction.amount.paid + transaction.amount.pending}` });
        }

        transaction.amount.paid = paid;
        transaction.amount.pending = pending;

        await transaction.save();
        res.status(200).json({ message: 'Transaction status updated successfully', transaction });
    }
    catch(error){
        console.error('Error updating transaction status:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
})

module.exports = router;