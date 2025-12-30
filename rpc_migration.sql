create or replace function get_inventory()
returns json
language plpgsql
as $$
begin
  return (
    select json_agg(
      json_build_object(
        'id', v.id,
        'make', v.make,
        'model', v.model,
        'year', v.year,
        'price', v.price,
        'mileage', v.mileage,
        'color', v.color,
        'vin', v.vin,
        'transmission', v.transmission,
        'fuel_type', v.fuel_type,
        'drivetrain', v.drivetrain,
        'description', v.description,
        'status', v.status,
        'featured', v.featured,
        'carfax_url', v.carfax_url,
        'created_at', v.created_at,
        'images', coalesce(
          (
            select json_agg(
              json_build_object(
                'id', i.id,
                'image_url', i.image_url,
                'is_primary', i.is_primary,
                'display_order', i.display_order
              ) order by i.is_primary desc, i.display_order asc
            )
            from vehicle_images i
            where i.vehicle_id = v.id
          ),
          '[]'::json
        )
      ) order by v.created_at desc
    )
    from vehicles v
    where v.status = 'available'
  );
end;
$$;
