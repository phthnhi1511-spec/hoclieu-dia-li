import Highcharts from "highcharts/highmaps";
import { useEffect, useMemo, useRef } from "react";
import {
  VIETNAM_ARCHIPELAGO_GEOJSON,
  VIETNAM_MAP_EXTENT_GEOJSON,
  getBoundsForProvinceNames,
  mergedVietnam34GeoJson,
  normalizeVietnamName,
} from "../lib/vietnamMap";

function withAlpha(color, alphaHex) {
  if (typeof color !== "string" || !color.startsWith("#")) {
    return color;
  }

  const normalizedColor = color.length === 4
    ? `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`
    : color;

  return `${normalizedColor}${alphaHex}`;
}

function buildChartOptions(onProvinceClickRef) {
  return {
    accessibility: { enabled: false },
    chart: {
      backgroundColor: "transparent",
      height: 720,
      map: mergedVietnam34GeoJson,
      spacing: [12, 12, 12, 12],
      style: {
        fontFamily: "inherit",
      },
    },
    credits: { enabled: false },
    legend: { enabled: false },
    mapNavigation: {
      buttonOptions: {
        align: "right",
        verticalAlign: "bottom",
      },
      enabled: true,
    },
    title: { text: undefined },
    tooltip: { enabled: false },
    series: [
      {
        allAreas: false,
        borderColor: "#ffffff",
        borderWidth: 1,
        cursor: "pointer",
        data: [],
        dataLabels: {
          enabled: false,
        },
        joinBy: "hc-key",
        name: "Tỉnh/thành phố",
        point: {
          events: {
            click() {
              onProvinceClickRef.current?.({
                name: this.name,
                regionId: this.options.custom?.regionId || null,
              });
            },
          },
        },
        states: {
          hover: {
            borderColor: "#0f440f",
            borderWidth: 1.4,
          },
          inactive: {
            opacity: 1,
          },
        },
        type: "map",
      },
      {
        animation: false,
        allAreas: true,
        borderColor: "#0f8f58",
        borderWidth: 1.2,
        color: "#d8f2e4",
        data: VIETNAM_ARCHIPELAGO_GEOJSON.features.map((feature) => ({
          "hc-key": feature.properties["hc-key"],
          name: feature.properties.name,
        })),
        dataLabels: {
          allowOverlap: true,
          crop: false,
          enabled: true,
          format: "{point.name}",
          overflow: "allow",
          style: {
            color: "#0f440f",
            fontSize: "12px",
            fontWeight: "800",
            textOutline: "2px #ffffff",
          },
          x: 8,
        },
        enableMouseTracking: false,
        joinBy: "hc-key",
        mapData: VIETNAM_ARCHIPELAGO_GEOJSON,
        name: "Quần đảo Việt Nam",
        states: {
          inactive: { opacity: 1 },
        },
        type: "map",
      },
      {
        allAreas: true,
        animation: false,
        borderWidth: 0,
        color: "rgba(255, 255, 255, 0)",
        data: [{ "hc-key": "vn-map-extent", value: 1 }],
        enableMouseTracking: false,
        joinBy: "hc-key",
        mapData: VIETNAM_MAP_EXTENT_GEOJSON,
        name: "Phạm vi bản đồ",
        showInLegend: false,
        type: "map",
        zIndex: -1,
      },
    ],
  };
}

function VietnamEconomicMap({
  onProvinceClick,
  provinceRegionLookup,
  selectedProvinceName,
  selectedRegion,
}) {
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const onProvinceClickRef = useRef(onProvinceClick);

  useEffect(() => {
    onProvinceClickRef.current = onProvinceClick;
  }, [onProvinceClick]);

  const selectedProvinceKey = normalizeVietnamName(selectedProvinceName);
  const selectedRegionId = selectedRegion?.id ? String(selectedRegion.id) : "";

  const mapData = useMemo(() => {
    const hasRegionFocus = Boolean(selectedRegionId);

    return mergedVietnam34GeoJson.features.map((feature) => {
      const provinceName = feature.properties.name;
      const provinceKey = normalizeVietnamName(provinceName);
      const region = provinceRegionLookup.get(provinceKey) || null;
      const isSelectedProvince = provinceKey === selectedProvinceKey;
      const isSelectedRegion = region && String(region.id) === selectedRegionId;
      const baseColor = region?.color || "#dbe6dc";

      let color = baseColor;

      if (hasRegionFocus && !isSelectedRegion) {
        color = withAlpha(baseColor, region ? "3D" : "2E");
      }

        return {
          "hc-key": feature.properties["hc-key"],
          borderColor: isSelectedProvince ? "#0f440f" : "#ffffff",
          borderWidth: isSelectedProvince ? 2.4 : isSelectedRegion ? 1.2 : 1,
          color,
          custom: {
            provinceName,
            regionId: region?.id || null,
          },
          name: provinceName,
        };
    });
  }, [provinceRegionLookup, selectedProvinceKey, selectedRegionId]);

  const focusedBounds = useMemo(() => {
    if (selectedRegion?.danhSachTinh?.length) {
      return getBoundsForProvinceNames(selectedRegion.danhSachTinh);
    }

    if (selectedProvinceName) {
      return getBoundsForProvinceNames([selectedProvinceName]);
    }

    return null;
  }, [selectedProvinceName, selectedRegion]);

  useEffect(() => {
    if (!containerRef.current) {
      return undefined;
    }

    const chart = Highcharts.mapChart(
      containerRef.current,
      buildChartOptions(onProvinceClickRef),
    );

    chartRef.current = chart;

    return () => {
      chart.destroy();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    const chart = chartRef.current;

    if (!chart?.series?.[0]) {
      return;
    }

    chart.series[0].setData(mapData, false, false, false);

    if (chart.mapView) {
      const nextBounds = focusedBounds || chart.series[2]?.bounds;

      if (nextBounds) {
        chart.mapView.fitToBounds(
          nextBounds,
          focusedBounds ? 30 : 18,
          false,
          { duration: 250 },
        );
      }
    }

    chart.redraw();
  }, [focusedBounds, mapData]);

  return <div ref={containerRef} className="economic-map-chart" />;
}

export default VietnamEconomicMap;
