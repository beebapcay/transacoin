import { TxIn } from '@models/tx-in.model';
import { UnspentTxOutRepo } from '@repos/unspent-tx-out.repo';
import { ReferenceTxOutNotFound } from "@shared/errors";

export class TxInRepo {
  /**
   * @description - Get amount of coins referenced by a txIn.
   *
   * @param txIn
   *
   * @throws ReferenceTxOutNotFound
   */
  static async getTxInAmount(txIn: TxIn): Promise<number> {
    const unspentTxOut = await UnspentTxOutRepo.getOne(txIn.txOutId, txIn.txOutIndex);
    if (!unspentTxOut) {
      throw new ReferenceTxOutNotFound(txIn.txOutId, txIn.txOutIndex);
    }
    return unspentTxOut.amount;
  }
}