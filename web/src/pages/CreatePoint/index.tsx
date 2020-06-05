import React, { useState, useEffect, useCallback, ChangeEvent, FormEvent } from "react";
import { Link, useHistory } from "react-router-dom";
import { FiArrowLeft, FiCheckCircle } from "react-icons/fi";
import { Map, TileLayer, Marker } from "react-leaflet";
import api from "../../services/api";
import Dropzone from "./Dropzone";
import "./styles.css";
import logo from "../../assets/logo.svg";

interface Item {
  id: number;
  title: string;
  image_url: string;
}

interface Uf {
  nome: string;
  sigla: string;
}

const CreatePoint = () => {
  const [position, setPosition] = useState({
    lat: -6.459365,
    lng: -37.0972828,
  });
  const [zoom, setZoom] = useState(15);
  const [items, setItems] = useState([] as Item[]);
  const [ufs, setUfs] = useState([] as Uf[]);
  const [cities, setCities] = useState([] as string[]);
  const [selectedUf, setSelectedUf] = useState({} as Uf);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [formData, setFormData] = useState({ name: "", email: "", whatsapp: "" });
  const [showModal, setShowModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File>();
  const history = useHistory();

  const handleMapClick = useCallback(({ latlng }) => {
    setPosition(latlng);
  }, []);

  const handleSelectUf = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const selectedSigle = event.target.value;
      const filteredUfs = ufs.filter((uf) => uf.sigla === selectedSigle);

      setSelectedUf(filteredUfs[0]);
    },
    [ufs]
  );

  const handleSelectCity = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedCity(event.target.value);
  }, []);

  const handleInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const field = event.target.name;
      const value = event.target.value;

      setFormData({ ...formData, [field]: value });

      console.log(formData);
    },
    [formData]
  );

  const isItemSelected = useCallback(
    (id: number) => {
      return selectedItems.indexOf(id) !== -1;
    },
    [selectedItems]
  );

  const handleSelectItem = useCallback(
    (id: number) => {
      if (!isItemSelected(id)) {
        setSelectedItems([...selectedItems, id]);
      } else {
        const itemsFiltered = selectedItems.filter((item) => item !== id);
        setSelectedItems(itemsFiltered);
      }
    },
    [selectedItems, isItemSelected]
  );

  const handleSubmit = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();

      const { name, email, whatsapp } = formData;
      const data = new FormData();

      data.append("name", name);
      data.append("email", email);
      data.append("whatsapp", whatsapp);
      data.append("latitude", String(position.lat));
      data.append("longitude", String(position.lng));
      data.append("city", selectedCity);
      data.append("uf", selectedUf.sigla);
      data.append("items", selectedItems.join(","));
      if (selectedFile) data.append("image", selectedFile);

      await api.post("points", data);

      setShowModal(true);
      setTimeout(() => {
        history.push("/");
        setShowModal(false);
      }, 2000);
    },
    [formData, position, selectedCity, selectedUf, selectedItems, history, selectedFile]
  );

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude: lat, longitude: lng } = position.coords;
      setPosition({ lat, lng });
    });
  }, []);

  useEffect(() => {
    async function getData() {
      api.get<Item[]>("/items/").then((response) => {
        setItems(response.data);
      });

      api
        .get<any[]>("https://servicodados.ibge.gov.br/api/v1/localidades/estados", { baseURL: "" })
        .then((response) => {
          setUfs(response.data.map((uf) => ({ nome: uf.nome, sigla: uf.sigla })));
        });
    }
    getData();
  }, []);

  useEffect(() => {
    async function getCities() {
      api.get<any[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf.sigla}/microrregioes`).then((response) => {
        setCities(response.data.map((city) => city.nome));
        console.log(response.data);
      });
    }
    console.log(selectedUf);

    getCities();
  }, [selectedUf]);
  console.log(selectedFile);
  return (
    <>
      <div className={showModal ? "show" : "none"} id="created-point">
        <FiCheckCircle />
        <h1>Cadastro concluído!</h1>
      </div>

      <div id="page-create-point">
        <header>
          <img src={logo} alt="Ecoleta" />

          <Link to="/">
            <FiArrowLeft />
            Voltar para home
          </Link>
        </header>

        <form onSubmit={handleSubmit}>
          <h1>
            Cadastro do <br /> ponto de coleta
          </h1>
          <Dropzone onFileUploaded={setSelectedFile} />
          <fieldset>
            <legend>
              <h2>Dados</h2>
            </legend>

            <div className="field">
              <label htmlFor="name">Nome da entidade</label>
              <input onChange={handleInputChange} type="text" id="name" name="name" />
            </div>
          </fieldset>

          <div className="field-group">
            <div className="field">
              <label htmlFor="email">E-mail</label>
              <input onChange={handleInputChange} type="email" id="email" name="email" />
            </div>

            <div className="field">
              <label htmlFor="whatsapp">Whatsapp</label>
              <input onChange={handleInputChange} type="text" id="whatsapp" name="whatsapp" />
            </div>
          </div>

          <fieldset>
            <legend>
              <h2>Endereços</h2>
              <span>Selecione o endereço no mapa</span>
            </legend>

            <Map
              onclick={handleMapClick}
              center={position}
              zoom={zoom}
              onzoomend={(event) => {
                setZoom(event.target._zoom);
              }}
            >
              <TileLayer
                attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <Marker position={position}></Marker>
            </Map>

            <div className="field-group">
              <div className="field">
                <label htmlFor="uf">Estado (UF)</label>
                <select name="uf" id="uf" onChange={handleSelectUf}>
                  <option value="0">Selecione uma UF</option>
                  {ufs.map((uf) => (
                    <option key={uf.nome} value={uf.sigla}>
                      {uf.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label htmlFor="city">Cidade</label>
                <select name="city" id="city" onChange={handleSelectCity}>
                  <option value="0">Selecione uma cidade</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend>
              <h2>Ítens de coleta</h2>
              <span>Selecione um ou mais ítens abaixo</span>
            </legend>

            <ul className="items-grid">
              {items.map((item) => (
                <li className={isItemSelected(item.id) ? "selected" : ""} key={item.id} onClick={() => handleSelectItem(item.id)}>
                  <img src={item.image_url} alt={item.title} />
                  <span>{item.title}</span>
                </li>
              ))}
            </ul>
          </fieldset>

          <button type="submit">Cadastrar ponto de coleta</button>
        </form>
      </div>
    </>
  );
};

export default CreatePoint;
