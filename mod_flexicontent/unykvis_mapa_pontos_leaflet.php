<?php
/**
 * $caching
 * $ordering
 * $count
 * $featured
 *
 * // Display parameters
 * $moduleclass_sfx
 * $layout
 * $add_ccs
 * $add_tooltips
 * $width
 * $height
 * // standard
 * $display_title
 * $link_title
 * $display_date
 * $display_text
 * $mod_readmore
 * $mod_use_image
 * $mod_link_image
 * // featured
 * $display_title_feat
 * $link_title_feat
 * $display_date_feat
 * $display_text_feat
 * $mod_readmore_feat
 * $mod_use_image_feat
 * $mod_link_image_feat
 *
 * // Fields parameters
 * $use_fields
 * $display_label
 * $fields
 * // featured
 * $use_fields_feat
 * $display_label_feat
 * $fields_feat
 *
 * // Custom parameters
 * $custom1
 * $custom2
 * $custom3
 * $custom4
 * $custom5
 */

// no direct access
defined('_JEXEC') or die('Restricted access');

$mod_width_feat 	= (int)$params->get('mod_width', 110);
$mod_height_feat 	= (int)$params->get('mod_height', 110);
$mod_width 				= (int)$params->get('mod_width', 80);
$mod_height 			= (int)$params->get('mod_height', 80);

$force_width_feat='';//"width='$mod_width_feat'";
$force_height_feat='';//"height='$mod_height_feat'";
$force_width='';//"width='$mod_width'";
$force_height='';//"height='$mod_height'";

$hide_label_onempty_feat = (int)$params->get('hide_label_onempty_feat', 0);
$hide_label_onempty      = (int)$params->get('hide_label_onempty', 0);


$app = JFactory::getApplication();
$document = JFactory::getDocument();
// $document->addScript('https://maps.googleapis.com/maps/api/js?key=AIzaSyALe5xOETgK5bVhEwUcLe23hXa7GJdNr7o');
//$document->addScript(JURI::ROOT().'modules/mod_flexicontent/tmpl/map_files/gomap.js');

$siteTemplatePath = JURI::base(true)."/templates/".$app->getTemplate();
$leafletLib = $siteTemplatePath . '/unklibs/leaflet';

// JS
$document->addScript($leafletLib . '/js/leaflet.js');
$document->addScript($leafletLib . '/js/map-api.js');

// CSS
$document->addStyleSheet($leafletLib . '/css/leaflet.css');
$document->addStyleSheet($leafletLib . '/css/custom-leaflet.css');



?>
<div class="mod<?php echo $module->id; ?> <?php echo $moduleclass_sfx; ?>" >

	<?php
	// Display FavList Information (if enabled)
	// include(JPATH_SITE.'/modules/mod_flexicontent/tmpl_common/favlist.php');

	// Display Category Information (if enabled)
	// include(JPATH_SITE.'/modules/mod_flexicontent/tmpl_common/category.php');


	foreach ($ordering as $ord) {

		if (isset($list[$ord]['standard'])) {

			$unkItems = $list[$ord]['standard'];
			$unkTotalItems = count($unkItems);


			$markers = [];
			$categs = [];


			foreach ($unkItems as $rowcount => $item) {

				$catId = $item->_row->catid;
				$catAlias = $item->_row->maincat_alias;
				$catName = $item->_row->maincat_title;

				if (!in_array($catAlias, array_keys($categs))) {
					$categs[$catAlias] = new stdClass;
					$categs[$catAlias]->id = $catId;
					$categs[$catAlias]->alias = $catAlias;
					$categs[$catAlias]->name = $catName;
					$categs[$catAlias]->total = 1;
				} else {
					$categs[$catAlias]->total++;
				}

				FlexicontentFields::getFieldDisplay($item->_row, 'latitude');
				FlexicontentFields::getFieldDisplay($item->_row, 'longitude');
				FlexicontentFields::getFieldDisplay($item->_row, 'img_artigo');
				FlexicontentFields::getFieldDisplay($item->_row, 'pin_map');


				$fields = $item->_row->fields;

				$lat = $fields['latitude']->display;
				$lng = $fields['longitude']->display;
				$photo = $fields['img_artigo']->display_large_src;
				$pinImg = $fields['pin_map']->display_small_src;
				$descp = flexicontent_html::striptagsandcut($item->_row->introtext, 110);

				$catSlug = $item->_row->categoryslug;
				$catLink = JRoute::_(FlexicontentHelperRoute::getCategoryRoute($catSlug));
				$link = $catLink.'#'.$item->id.'-'.$item->alias;



				$marker = [];

				$marker['id'] = $rowcount;
				$marker['lat'] = $lat;
				$marker['lng'] = $lng;
				$marker['title'] = $item->title;
				$marker['catTitle'] = $item->_row->maincat_title;
				$marker['catId'] = $item->_row->catid;
				$marker['photo'] = $photo;
				$marker['pinImg'] = $pinImg;
				$marker['descp'] = $descp;
				$marker['link'] = $link;


				$markers[] = $marker;
			}


			// FILTERS CONTAINER
			$output =
			"<div class='filter_cat'>".
				"<div class='wrapper'>";

				// SORT BY KEYS
				ksort($categs);
				foreach ($categs as $categ) {
					$totalCount = $categ->total < 10 ? "0{$categ->total}" : $categ->total;
					$output .=
					"<span data-id='{$categ->id}' class='filter {$categ->alias} cat_{$categ->id}'>".
						"<span class='ctitle'>{$categ->name}</span>".
						"<span class='total-items'>{$totalCount}</span>".
					"</span>";
				}

				$output .=
				"</div>".
			"</div>";

			// MAP CONTAINER
			$output .=
			"<div id='map'></div>";

			echo $output;

			$markersJson = json_encode($markers);
		}
	}
	?>
	<script>
	(function(){
		var module = {
			cfg: {
				name: 'LeafMap',
				selector: '.mod<?php echo $module->id; ?>',
				map: {
					idSelector: 'map',
					markers: <?php echo $markersJson; ?>
				}
			}
		};
		Unk.modules[module.cfg.name] = module;
	})();
	</script>
</div>