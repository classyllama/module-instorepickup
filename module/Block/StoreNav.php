<?php

namespace MagentoEse\InStorePickup\Block;

use MagentoEse\InStorePickup\Model\StoreLocationCookieManager;
use MagentoEse\InStorePickup\Model\StoreLocation;

/**
 * Store Location Navigation block
 */
class StoreNav extends \Magento\Framework\View\Element\Template
{
    /**
     * Store Location Cookie Manager
     *
     * @var StoreLocationCookieManager
     */
    protected $storeLocationCookieManager;

    /**
     * Store Location
     *
     * @var StoreLocation
     */
    protected $storeLocation;

    /**
     * @param \Magento\Framework\View\Element\Template\Context $context
     * @param StoreLocationCookieManager $storeLocationCookieManager
     * @param StoreLocation $storeLocation
     * @param array $data
     */
    public function __construct(
        \Magento\Framework\View\Element\Template\Context $context,
        StoreLocationCookieManager $storeLocationCookieManager,
        StoreLocation $storeLocation,
        array $data = []
    ) {
        $this->storeLocationCookieManager = $storeLocationCookieManager;
        $this->storeLocation = $storeLocation;
        parent::__construct($context, $data);
    }

    /**
     * Get the current chosen store location
     *
     * @return StoreLocation
     */
    public function getChosenStoreLocation()
    {
        $currentStoreLocationId = $this->storeLocationCookieManager->getStoreLocationIdFromCookie();
        $this->storeLocation->load($currentStoreLocationId);
        return $this->storeLocation;
    }

    /**
     * Flag indicating if a store has been chosen already
     *
     * @return bool
     */
    public function hasStoreBeenChosen()
    {
        // Return true if there is an ID value
        return $this->storeLocationCookieManager->getStoreLocationIdFromCookie() > 0;
    }
}
