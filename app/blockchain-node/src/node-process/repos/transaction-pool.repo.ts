import { DataNotFound, InvalidTransaction } from '@shared/errors';
import logger from 'jet-logger';
import * as _ from 'lodash';
import { TransactionPool } from '../models/transaction-pool.model';
import { Transaction } from '../models/transaction.model';
import { UnspentTxOut, UnspentTxOutUtil } from '../models/unspent-tx-out.model';
import { TransactionPoolValidator } from '../validators/transaction-pool.validator';
import { TransactionValidator } from '../validators/transaction.validator';
import { Database } from './database';

export class TransactionPoolRepo {
  /**
   * @description - Get the transaction pool
   */
  public static async get(): Promise<TransactionPool> {
    return Database.TransactionPoolDB;
  }

  public static async getById(id: string): Promise<Transaction> {
    const transaction = Database.TransactionPoolDB.transactions.find(tx => tx.id === id);
    if (!transaction) throw new DataNotFound(Transaction.name);
    return transaction;
  }

  /**
   * @description - Add a transaction to the transaction pool
   *
   * @param tx
   */
  public static async add(tx: Transaction): Promise<void> {
    const unspentTxOuts = Database.UnspentTxOutsDB;

    if (!TransactionValidator.validate(tx, unspentTxOuts)) {
      throw new InvalidTransaction();
    }

    if (!TransactionPoolValidator.validateTransactionInPool(tx, Database.TransactionPoolDB)) {
      throw new Error('Trying to add an already existing txIn transaction');
    }

    Database.TransactionPoolDB.transactions.push(tx);
  }

  /**
   * @description - Update by remove a transaction invalid from the transaction pool
   *
   * @param unspentTxOuts
   */
  public static update(unspentTxOuts: UnspentTxOut[]) {
    const invalidTxs: Transaction[] = [];

    for (const tx of Database.TransactionPoolDB.transactions) {
      for (const txIn of tx.txIns) {
        if (!UnspentTxOutUtil.hasTxIn(txIn, unspentTxOuts)) {
          invalidTxs.push(tx);
          break;
        }
      }
    }

    if (invalidTxs.length > 0) {
      logger.info(`Removing ${invalidTxs.length} invalid transactions`);
      Database.TransactionPoolDB.transactions = _.without(Database.TransactionPoolDB.transactions, ...invalidTxs);
    }
  }

}