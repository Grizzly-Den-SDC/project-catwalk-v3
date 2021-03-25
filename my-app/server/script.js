import { check } from 'k6';
import http from 'k6/http';

export default function () {
  const res = http.get('http://localhost:3000/products?product_id=1000010');
  check(res, { 'is status 200': (r) => r.status === 200 });
}
