do $$
declare
  v_seller uuid := pg_temp.make_user('seller');
  v_admin uuid := pg_temp.make_user('admin');
  v_inactive uuid := pg_temp.make_user('seller', false);
  v_n int;
begin
  perform pg_temp.make_product('RLS-1', 3, 6000, 10000, 8000, 250);
  perform pg_temp.make_product('RLS-2', -2, 12000, 20000, 15000, 500);

  perform pg_temp.login_as(v_seller);
  select count(*) into v_n from public.products;
  assert v_n = 2, 'seller sees products';
  update public.products set name = 'Renamed' where barcode = 'RLS-1';
  get diagnostics v_n = row_count;
  assert v_n = 1, 'seller can rename a product';
  perform pg_temp.expect_error('update public.products set stock = 99', 'permission denied');
  perform pg_temp.expect_error('update public.products set barcode = ''X''', 'permission denied');
  perform pg_temp.expect_error(
    'insert into public.orders (seller_id, type, payment_method, status) values (auth.uid(), ''store'', ''cash'', ''completed'')',
    'permission denied');
  perform pg_temp.expect_error('delete from public.products', 'permission denied');
  update public.app_settings set kr_shipping_krw = 1;
  get diagnostics v_n = row_count;
  assert v_n = 0, 'seller cannot change settings';
  select cost_value into v_n from public.inventory_summary;
  assert v_n = 18000, 'inventory_summary ignores negative stock: got ' || v_n;
  perform pg_temp.logout();

  perform pg_temp.login_as(v_admin);
  select count(*) into v_n from public.products;
  assert v_n = 0, 'admin does not see products';
  update public.app_settings set kr_shipping_krw = 4500;
  get diagnostics v_n = row_count;
  assert v_n = 1, 'admin can change settings';
  perform pg_temp.logout();

  perform pg_temp.login_as(v_inactive);
  select count(*) into v_n from public.products;
  assert v_n = 0, 'inactive seller sees nothing';
  perform pg_temp.logout();

  set local role anon;
  perform pg_temp.expect_error('select count(*) from public.products', 'permission denied');
  perform pg_temp.expect_error('select count(*) from public.orders', 'permission denied');
  reset role;
end $$;
