do $$
declare
  v_seller uuid := pg_temp.make_user('seller');
  v_admin uuid := pg_temp.make_user('admin');
  a uuid := pg_temp.make_product('ST-A', 0, 6000, 10000, 8000, 250);
  p public.products;
  v_n int;
begin
  perform pg_temp.login_as(v_seller);
  select * into p from public.restock_product(a, 10, 6500);
  assert p.stock = 10 and p.cost_price = 6500, 'restock with cost';
  select count(*) into v_n from public.stock_movements where product_id = a and kind = 'restock' and qty_change = 10 and cost_price = 6500;
  assert v_n = 1, 'restock movement';
  select * into p from public.restock_product(a, 10);
  assert p.stock = 20 and p.cost_price = 6500, 'restock keeps cost';
  perform pg_temp.expect_error(format('select public.restock_product(%L::uuid, 0)', a), 'INVALID_QTY');
  select * into p from public.restock_product(a, 10);

  select * into p from public.adjust_stock(a, 37);
  assert p.stock = 37, 'adjust sets stock';
  select count(*) into v_n from public.stock_movements where product_id = a and kind = 'adjust' and qty_change = 7;
  assert v_n = 1, 'adjust movement +7';
  perform public.adjust_stock(a, 37);
  select count(*) into v_n from public.stock_movements where product_id = a and kind = 'adjust';
  assert v_n = 1, 'no-op adjust writes no movement';
  perform pg_temp.expect_error(format('select public.adjust_stock(%L::uuid, -1)', a), 'INVALID_STOCK');
  perform pg_temp.expect_error(format('select public.adjust_stock(%L::uuid, 5)', gen_random_uuid()), 'PRODUCT_NOT_FOUND');
  perform pg_temp.logout();

  perform pg_temp.login_as(v_admin);
  perform pg_temp.expect_error(format('select public.restock_product(%L::uuid, 1)', a), 'NOT_AUTHORIZED');
  perform pg_temp.logout();
end $$;
