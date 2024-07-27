class Block {
    constructor(index, timestamp, transactions, previousHash, nonce = 0) {
        this.index = index;
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.nonce = nonce;
        this.hash = this.computeHash();
    }

    computeHash() {
        return CryptoJS.SHA256(JSON.stringify(this)).toString();
    }
}

class Blockchain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.unconfirmedTransactions = [];
        this.difficulty = 2;
    }

    createGenesisBlock() {
        return new Block(0, Date.now(), [], "0");
    }

    getLastBlock() {
        return this.chain[this.chain.length - 1];
    }

    addBlock(block, proof) {
        const previousHash = this.getLastBlock().hash;
        if (previousHash !== block.previousHash) return false;
        if (!this.isValidProof(block, proof)) return false;
        block.hash = proof;
        this.chain.push(block);
        return true;
    }

    proofOfWork(block) {
        block.nonce = 0;
        let computedHash = block.computeHash();
        while (!computedHash.startsWith('0'.repeat(this.difficulty))) {
            block.nonce++;
            computedHash = block.computeHash();
        }
        return computedHash;
    }

    addTransaction(transaction) {
        this.unconfirmedTransactions.push(transaction);
    }

    mine() {
        if (this.unconfirmedTransactions.length === 0) return false;
        const lastBlock = this.getLastBlock();
        const newBlock = new Block(
            lastBlock.index + 1,
            Date.now(),
            this.unconfirmedTransactions,
            lastBlock.hash
        );
        const proof = this.proofOfWork(newBlock);
        this.addBlock(newBlock, proof);
        this.unconfirmedTransactions = [];
        return newBlock;
    }

    isValidProof(block, hash) {
        return hash.startsWith('0'.repeat(this.difficulty)) && hash === block.computeHash();
    }

    isValidChain() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];
            if (currentBlock.hash !== currentBlock.computeHash()) return false;
            if (currentBlock.previousHash !== previousBlock.hash) return false;
        }
        return true;
    }
}

const blockchain = new Blockchain();

function addTransaction() {
    const sender = document.getElementById('sender').value;
    const recipient = document.getElementById('recipient').value;
    const amount = document.getElementById('amount').value;

    if (!sender || !recipient || !amount) {
        alert("All fields are required");
        return;
    }

    blockchain.addTransaction({ sender, recipient, amount });
    alert("Transaction added");

    document.getElementById('sender').value = '';
    document.getElementById('recipient').value = '';
    document.getElementById('amount').value = '';
}

function mineBlock() {
    const newBlock = blockchain.mine();
    if (!newBlock) {
        alert("No transactions to mine");
        return;
    }
    alert("Block mined");
    updateBlockchainDisplay();
}

function updateBlockchainDisplay() {
    const blockchainElement = document.getElementById('blockchain');
    blockchainElement.textContent = JSON.stringify(blockchain.chain, null, 2);
}

document.addEventListener('DOMContentLoaded', () => {
    updateBlockchainDisplay();
});
