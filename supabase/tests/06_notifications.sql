-- low_stock_products view
do $$
declare
  v_seller uuid := pg_temp.make_user('seller');
  v_admin uuid := pg_temp.make_user('admin');
  low uuid := pg_temp.make_product('NT-LOW', 9, 1, 1, 1, 1);
  ok uuid := pg_temp.make_product('NT-OK', 11, 1, 1, 1, 1);
  arch uuid := pg_temp.make_product('NT-ARCH', 1, 1, 1, 1, 1);
  v_n int;
begin
  update public.products set is_archived = true where id = arch;
  perform pg_temp.login_as(v_seller);
  select count(*) into v_n from public.low_stock_products where id = low;
  assert v_n = 1, 'stock 9 / threshold 10 is low';
  select count(*) into v_n from public.low_stock_products where id in (ok, arch);
  assert v_n = 0, 'stock above threshold and archived products are not listed';
  perform pg_temp.logout();
  perform pg_temp.login_as(v_admin);
  select count(*) into v_n from public.low_stock_products;
  assert v_n = 0, 'admin sees nothing';
  perform pg_temp.logout();
end $$;
