import { call, put, takeLatest } from 'redux-saga/effects';
import { fetchStocksRequest, fetchStocksSuccess, fetchStocksFailure, Stock } from '../slices/stocksSlice';
import { fetchStocksApi } from '../../services/stocks';

function* fetchStocks() {
  try {
    const stocks: Stock[] = yield call(fetchStocksApi);
    yield put(fetchStocksSuccess(stocks));
  } catch (error) {
    yield put(fetchStocksFailure(error instanceof Error ? error.message : 'Failed to fetch stocks'));
  }
}

export default function* stocksSaga() {
  yield takeLatest(fetchStocksRequest.type, fetchStocks);
}
