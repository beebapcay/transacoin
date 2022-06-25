import { Transaction } from "@models/transaction.model";
import { TxIn } from '@models/tx-in.model';
import * as _ from 'lodash';

export class UnspentTxOut {
  constructor(
    public readonly txOutId: string,
    public readonly txOutIndex: number,
    public readonly address: string,
    public readonly amount: number
  ) {
  }
}

export class UnspentTxOutUtil {
  /**
   * @description - Check if an unspent transaction output exists in the unspent transaction outputs
   *
   * @param id
   * @param index
   * @param unspentTxOuts
   */
  public static exists(id: string, index: number, unspentTxOuts: UnspentTxOut[]): boolean {
    return !!unspentTxOuts.find((uTxO) => uTxO.txOutId === id && uTxO.txOutIndex === index);
  }


  /**
   * @description - Get unspent transaction outputs for a given address
   *
   * @param address
   * @param unspentTxOuts
   */
  public static getUnspentTxOuts(address: string, unspentTxOuts: UnspentTxOut[]): UnspentTxOut[] {
    return unspentTxOuts.filter(unspentTxOut => unspentTxOut.address === address);
  }

  /**
   * @description - Check txIn reference txOut is in the unspent transaction outputs
   *
   * @param txIn
   * @param unspentTxOuts
   */
  public static hasTxIn(txIn: TxIn, unspentTxOuts: UnspentTxOut[]): boolean {
    return !!unspentTxOuts.find(unspentTxOut => unspentTxOut.txOutId === txIn.txOutId && unspentTxOut.txOutIndex === txIn.txOutIndex);
  }

  /**
   * @description - Update unspent transaction outputs with new transactions.
   *
   * @param newTransactions
   * @param aUnspentTxOut
   */
  public static update(newTransactions: Transaction[], aUnspentTxOut: UnspentTxOut[]): UnspentTxOut[] {
    const newUnspentTxOuts = newTransactions
      .map((t) => t.txOuts.map((txOut, index) => new UnspentTxOut(t.id, index, txOut.address, txOut.amount))
      .reduce((a, b) => a.concat(b), [] as UnspentTxOut[]));

    const consumedTxOuts = newTransactions
      .map((t) => t.txIns)
      .reduce((a, b) => a.concat(b), [])
      .map((txIn) => new UnspentTxOut(txIn.txOutId, txIn.txOutIndex, '', 0));

    return aUnspentTxOut
      .filter((uTxO) => UnspentTxOutUtil.exists(uTxO.txOutId, uTxO.txOutIndex, consumedTxOuts))
      .concat(_.flatten(newUnspentTxOuts));
  }
}