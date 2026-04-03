import pool from "../db/db.js";

export const getPlaces = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * from places
    `);

    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error obteniendo los lugares places" });
  }
};
export const getPlace = async (req, res) => {
  try {
    const placeId= req.params.id;
    const result = await pool.query(`
      SELECT * from places where id=${placeId}
    `);

    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error obteniendo los lugares places" });
  }
};
export const addPlace = async (req, res) => {
  const data= req.body;
  console.log(data)
  const query = 'INSERT INTO places (name, type, lat, lng, avg_price) VALUES ($1,$2,$3,$4,$5) returning *'
  try {
    const values =[data.name, data.type, data.lat,data.lng,data.avg];
    const result = await pool.query(query,values);
    const resultID =result.rows[0].id;

    // En el caso de que hayan tags al crear
    if(data.tags.length>0){
      const tags = await pool.query(`select * from tags`);
      console.log(tags.rows)
      //Busca las coincidencias de los nombres de tags para luego pasar los IDs
      const tagsIDs = tags.rows
        .filter((tag) => data.tags.includes(tag.name))
        .map((tag) => tag.id);
        //Se prepara el query
        let tagsQuery = `INSERT INTO place_tags (place_id, tag_id) values `

        
      if(tagsIDs.length>0){
        let values =[]
        tagsIDs.map(tag =>{
          values.push(`(${resultID},${tag})`)
        })
        tagsQuery+= values.join(" , ")
        // Se inserta la relacion de los tags
        await pool.query(tagsQuery)
      }
      
    }
    

    res.status(201).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error creando el lugar" });
  }
};
export const delPlace = async (req, res) => {
  try {
    const placeId= req.params.id;
    const result = await pool.query(`
      delete from places where id=${placeId}
    `);

    res.status(204).json("Lugar borrado exitosamente");
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error borrando el lugar" });
  }
};