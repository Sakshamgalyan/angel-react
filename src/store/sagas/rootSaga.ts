import { all } from 'redux-saga/effects';
import stocksSaga from './stocksSaga';

export default function* rootSaga() {
  yield all([
    stocksSaga(),
  ]);
}
