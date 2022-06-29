import { ReferenceTxOutNotFound, SignTransactionFromWrongAddress } from '@shared/errors';
import { EncryptUtil } from '@shared/utils/encrypt.util';
import { Transaction } from './transaction.model';
import { UnspentTxOut } from './unspent-tx-out.model';

export class TxIn {
  constructor(
    public txOutId: string,
    public txOutIndex: number,
    public signature: string
  ) {
  }
}

export class TxInUtil {

  /**
   * @description - Sign a txIn with a given privateKey
   *
   * @param transaction
   * @param txInIndex
   * @param privateKey
   * @param aUnspentTxOuts
   */
  public static signTxIn(
    transaction: Transaction,
    txInIndex: number,
    privateKey: string,
    aUnspentTxOuts: UnspentTxOut[]
  ): string {
    const txIn = transaction.txIns[txInIndex];

    const dataToSign = transaction.id;
    const referencedUnspentTxOut = aUnspentTxOuts.find(txOut => txOut.txOutId === txIn.txOutId && txOut.txOutIndex === txIn.txOutIndex);

    if (!referencedUnspentTxOut) {
      throw new ReferenceTxOutNotFound(txIn.txOutId, txIn.txOutIndex);
    }

    if (EncryptUtil.getPublicKey(privateKey) !== referencedUnspentTxOut.address) {
      throw new SignTransactionFromWrongAddress();
    }

    return EncryptUtil.signSignature(privateKey, dataToSign);
  }

  /**
   * @description - Get the amount if referenced unspentTxOut
   *
   * @param txIn
   * @param aUnspentTxOuts
   */
  public static getTxInAmount(txIn: TxIn, aUnspentTxOuts: UnspentTxOut[]): number {
    const referencedUnspentTxOut = aUnspentTxOuts.find(txOut => txOut.txOutId === txIn.txOutId && txOut.txOutIndex === txIn.txOutIndex);

    if (!referencedUnspentTxOut) {
      throw new ReferenceTxOutNotFound(txIn.txOutId, txIn.txOutIndex);
    }

    return referencedUnspentTxOut.amount;
  }
}